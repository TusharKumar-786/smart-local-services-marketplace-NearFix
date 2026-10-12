from decimal import Decimal

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers

from services.models import Area, ProviderProfile, ServiceCategory
from services.slots import is_slot_free

from .models import Booking, Complaint, Payment, Review
from .workflow import allowed_actions


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source="get_method_display", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "booking", "amount", "method", "method_display", "status", "transaction_reference", "paid_at", "created_at"]
        read_only_fields = fields


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    booking = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())

    class Meta:
        model = Review
        fields = ["id", "booking", "provider", "customer_name", "rating", "comment", "created_at"]
        read_only_fields = ["id", "provider", "customer_name", "created_at"]

    def get_customer_name(self, obj):
        return obj.customer.first_name or "Customer"

    def validate_booking(self, booking):
        user = self.context["request"].user
        if booking.customer_id != user.id:
            raise serializers.ValidationError("You can only review your own bookings.")
        if booking.status != Booking.Status.COMPLETED:
            raise serializers.ValidationError("You can review a booking only after it is completed.")
        if Review.objects.filter(booking=booking).exists():
            raise serializers.ValidationError("You have already reviewed this booking.")
        return booking

    def create(self, validated_data):
        booking = validated_data["booking"]
        try:
            with transaction.atomic():
                return Review.objects.create(customer=booking.customer, provider=booking.provider, **validated_data)
        except IntegrityError:
            raise serializers.ValidationError({"booking": ["You have already reviewed this booking."]})


class ComplaintSerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())

    class Meta:
        model = Complaint
        fields = ["id", "booking", "description", "status", "resolution_note", "created_at", "updated_at"]
        read_only_fields = ["id", "status", "resolution_note", "created_at", "updated_at"]

    def validate_booking(self, booking):
        if booking.customer_id != self.context["request"].user.id:
            raise serializers.ValidationError("You can only report issues with your own bookings.")
        return booking

    def validate_description(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Please describe the issue in at least 10 characters.")
        return value.strip()


class BookingSerializer(serializers.ModelSerializer):
    provider = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    area = serializers.CharField(source="area.name", read_only=True, default=None)
    payment = PaymentSerializer(read_only=True)
    review = ReviewSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    allowed_actions = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id", "provider", "customer", "category", "area", "address", "description", "scheduled_at",
            "urgency", "quoted_price", "match_score", "status", "status_display", "cancellation_reason",
            "payment", "review", "allowed_actions", "created_at", "updated_at",
        ]

    def get_provider(self, obj):
        return {"id": obj.provider_id, "name": obj.provider.display_name, "phone": obj.provider.user.phone}

    def get_customer(self, obj):
        return {"id": obj.customer_id, "name": obj.customer.get_full_name() or obj.customer.email, "phone": obj.customer.phone}

    def get_category(self, obj):
        return {"slug": obj.category.slug, "name": obj.category.name}

    def get_allowed_actions(self, obj):
        return allowed_actions(obj, self.context["request"].user)


class BookingCreateSerializer(serializers.Serializer):
    provider = serializers.PrimaryKeyRelatedField(queryset=ProviderProfile.objects.select_related("user"))
    category = serializers.SlugRelatedField(slug_field="slug", queryset=ServiceCategory.objects.filter(is_active=True))
    area = serializers.SlugRelatedField(slug_field="slug", queryset=Area.objects.all(), required=False, allow_null=True)
    address = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    scheduled_at = serializers.DateTimeField()
    urgency = serializers.ChoiceField(choices=Booking.Urgency.choices, default=Booking.Urgency.NORMAL)
    match_score = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True,
                                           min_value=Decimal("0"), max_value=Decimal("100"))

    def validate_scheduled_at(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Choose a time in the future.")
        if value.minute or value.second or value.microsecond:
            raise serializers.ValidationError("Bookings start on the hour, e.g. 10:00.")
        return value

    def validate(self, attrs):
        provider = attrs["provider"]
        if not provider.is_bookable:
            raise serializers.ValidationError({"provider": ["This provider is not verified or is blocked."]})
        if not provider.is_available:
            raise serializers.ValidationError({"provider": ["This provider is not accepting bookings."]})
        if provider.base_price is None or provider.base_price <= 0:
            raise serializers.ValidationError({"provider": ["This provider has no valid price."]})
        if not provider.categories.filter(pk=attrs["category"].pk).exists():
            raise serializers.ValidationError({"category": ["This provider does not offer this service."]})
        area = attrs.get("area") or self.context["request"].user.area
        attrs["area"] = area
        if area and not provider.service_areas.filter(pk=area.pk).exists():
            raise serializers.ValidationError({"area": ["This provider does not serve your area."]})
        if attrs["urgency"] == Booking.Urgency.EMERGENCY and not provider.emergency_available:
            raise serializers.ValidationError({"urgency": ["This provider does not take emergency jobs."]})
        return attrs

    def create(self, validated_data):
        provider = validated_data["provider"]
        slot_taken = serializers.ValidationError(
            {"scheduled_at": ["This time slot is no longer available. Please pick another slot."]}
        )
        try:
            with transaction.atomic():
                # Lock the provider row so two customers booking at the same
                # moment are processed one after the other.
                ProviderProfile.objects.select_for_update().get(pk=provider.pk)
                if not is_slot_free(provider, validated_data["scheduled_at"]):
                    raise slot_taken
                booking = Booking.objects.create(
                    customer=self.context["request"].user,
                    quoted_price=provider.base_price,
                    **validated_data,
                )
                Payment.objects.create(booking=booking, amount=booking.quoted_price)
        except IntegrityError:
            # The partial unique constraint caught a double booking.
            raise slot_taken
        return booking


class StatusUpdateSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["accept", "reject", "start", "complete", "cancel"])
    reason = serializers.CharField(required=False, allow_blank=True, max_length=255)


class PaySerializer(serializers.Serializer):
    method = serializers.ChoiceField(choices=Payment.Method.choices)
