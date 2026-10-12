from rest_framework import serializers

from .models import Area, Availability, ProviderProfile, ServiceCategory


class ServiceCategorySerializer(serializers.ModelSerializer):
    provider_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "slug", "description", "icon", "provider_count"]


class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ["id", "name", "slug"]


class AvailabilitySerializer(serializers.ModelSerializer):
    weekday_name = serializers.CharField(source="get_weekday_display", read_only=True)

    class Meta:
        model = Availability
        fields = ["id", "weekday", "weekday_name", "start_time", "end_time"]

    def validate(self, attrs):
        start = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end = attrs.get("end_time", getattr(self.instance, "end_time", None))
        weekday = attrs.get("weekday", getattr(self.instance, "weekday", None))
        if start and end and end <= start:
            raise serializers.ValidationError({"end_time": ["End time must be after start time."]})
        provider = self.context["request"].user.provider_profile
        overlapping = provider.availability.filter(weekday=weekday, start_time__lt=end, end_time__gt=start)
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        if overlapping.exists():
            raise serializers.ValidationError({"non_field_errors": ["This overlaps another time window on the same day."]})
        return attrs


class ProviderListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="display_name", read_only=True)
    categories = ServiceCategorySerializer(many=True, read_only=True)
    base_area = serializers.CharField(source="base_area.name", read_only=True, default=None)
    skills = serializers.ListField(source="skill_list", read_only=True)

    class Meta:
        model = ProviderProfile
        fields = [
            "id", "name", "bio", "categories", "skills", "base_area", "base_price", "experience_years",
            "response_time_minutes", "average_rating", "review_count", "is_available",
            "emergency_available", "verification_status",
        ]


class ProviderDetailSerializer(ProviderListSerializer):
    service_areas = AreaSerializer(many=True, read_only=True)
    availability = AvailabilitySerializer(many=True, read_only=True)

    class Meta(ProviderListSerializer.Meta):
        fields = ProviderListSerializer.Meta.fields + ["service_areas", "availability", "created_at"]


class MyProviderProfileSerializer(serializers.ModelSerializer):
    """Provider edits their own profile. Verification and rating are read-only."""

    name = serializers.CharField(source="display_name", read_only=True)
    categories = serializers.SlugRelatedField(
        slug_field="slug", many=True, queryset=ServiceCategory.objects.filter(is_active=True)
    )
    service_areas = serializers.SlugRelatedField(slug_field="slug", many=True, queryset=Area.objects.all())
    base_area = serializers.SlugRelatedField(slug_field="slug", queryset=Area.objects.all(), allow_null=True)
    availability = AvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = ProviderProfile
        fields = [
            "id", "name", "bio", "categories", "skills", "base_area", "service_areas", "base_price",
            "experience_years", "response_time_minutes", "is_available", "emergency_available",
            "verification_status", "is_blocked", "average_rating", "review_count", "availability",
        ]
        read_only_fields = ["verification_status", "is_blocked", "average_rating", "review_count"]

    def validate_base_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
