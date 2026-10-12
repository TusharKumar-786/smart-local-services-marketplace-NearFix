from django.db import transaction
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsCustomer
from services.models import ProviderProfile, ServiceCategory

from .models import Booking, Complaint, Payment, Review
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    ComplaintSerializer,
    PaySerializer,
    PaymentSerializer,
    ReviewSerializer,
    StatusUpdateSerializer,
)
from .workflow import CUSTOMER_CANCELLABLE, PROVIDER_TRANSITIONS


def bookings_for(user):
    queryset = Booking.objects.select_related(
        "customer", "provider__user", "category", "area", "payment", "review"
    )
    if user.is_staff:
        return queryset
    if user.role == "provider" and hasattr(user, "provider_profile"):
        return queryset.filter(provider=user.provider_profile)
    return queryset.filter(customer=user)


class BookingViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    filterset_fields = ["urgency"]
    ordering_fields = ["scheduled_at", "created_at"]

    def get_queryset(self):
        queryset = bookings_for(self.request.user)
        # ?status=pending or ?status=pending,accepted
        statuses = [s for s in self.request.query_params.get("status", "").split(",") if s]
        if statuses:
            queryset = queryset.filter(status__in=statuses)
        return queryset

    def get_serializer_class(self):
        return BookingCreateSerializer if self.action == "create" else BookingSerializer

    def get_permissions(self):
        if self.action in ("create", "pay"):
            return [IsCustomer()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = BookingCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        booking = self.get_queryset().get(pk=booking.pk)
        return Response(BookingSerializer(booking, context={"request": request}).data, status=status.HTTP_201_CREATED)

    def _respond(self, booking):
        booking = self.get_queryset().get(pk=booking.pk)
        return Response(BookingSerializer(booking, context={"request": self.request}).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.customer_id != request.user.id:
            raise PermissionDenied("Only the customer can cancel here. Providers use the status endpoint.")
        if booking.status not in CUSTOMER_CANCELLABLE:
            raise ValidationError({"status": [f"A {booking.get_status_display().lower()} booking cannot be cancelled."]})
        if booking.scheduled_at <= timezone.now():
            raise ValidationError({"status": ["The service time has already started."]})
        self._cancel(booking, request.data.get("reason", ""))
        return self._respond(booking)

    @staticmethod
    def _cancel(booking, reason):
        with transaction.atomic():
            booking.status = Booking.Status.CANCELLED
            booking.cancellation_reason = (reason or "")[:255]
            booking.save(update_fields=["status", "cancellation_reason", "updated_at"])
            payment = getattr(booking, "payment", None)
            if payment and payment.status == Payment.Status.PAID:
                payment.status = Payment.Status.REFUNDED
                payment.save(update_fields=["status"])

    @action(detail=True, methods=["post"])
    def status(self, request, pk=None):
        booking = self.get_object()
        profile = getattr(request.user, "provider_profile", None)
        if not profile or booking.provider_id != profile.id:
            raise PermissionDenied("Only the assigned provider can update this booking.")
        serializer = StatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        name = serializer.validated_data["action"]
        source, target = PROVIDER_TRANSITIONS[name]
        if booking.status != source:
            raise ValidationError({"action": [f"Cannot {name} a booking that is {booking.get_status_display().lower()}."]})
        if name == "cancel":
            self._cancel(booking, serializer.validated_data.get("reason", "Cancelled by provider"))
        else:
            booking.status = target
            booking.save(update_fields=["status", "updated_at"])
        return self._respond(booking)

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        """MOCK payment: marks the payment as paid. No real money moves."""
        booking = self.get_object()
        serializer = PaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if booking.status not in (Booking.Status.ACCEPTED, Booking.Status.IN_PROGRESS, Booking.Status.COMPLETED):
            raise ValidationError({"status": ["You can pay once the provider has accepted the booking."]})
        with transaction.atomic():
            payment = Payment.objects.select_for_update().get(booking=booking)
            if payment.status != Payment.Status.PENDING:
                raise ValidationError({"payment": ["This booking is already paid."]})
            payment.method = serializer.validated_data["method"]
            payment.status = Payment.Status.PAID
            payment.paid_at = timezone.now()
            payment.save()
        return self._respond(booking)


class ReviewViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsCustomer()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        queryset = Review.objects.select_related("customer", "provider__user")
        if user.role == "provider" and hasattr(user, "provider_profile"):
            return queryset.filter(provider=user.provider_profile)
        return queryset.filter(customer=user)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.select_related("booking")
        if user.is_staff:
            return queryset
        if user.role == "provider" and hasattr(user, "provider_profile"):
            return queryset.filter(booking__provider=user.provider_profile)
        return queryset.filter(booking__customer=user)


class ComplaintViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return Complaint.objects.filter(customer=self.request.user).select_related("booking")

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from accounts.models import User

        by_status = dict(Booking.objects.values_list("status").annotate(n=Count("id")))
        top_categories = list(
            ServiceCategory.objects.annotate(n=Count("bookings")).order_by("-n").values("name", "n")[:5]
        )
        return Response({
            "users": {
                "customers": User.objects.filter(role="customer").count(),
                "providers": User.objects.filter(role="provider").count(),
            },
            "providers_pending_verification": ProviderProfile.objects.filter(verification_status="pending").count(),
            "bookings_by_status": by_status,
            "emergency_bookings": Booking.objects.filter(urgency="emergency").count(),
            "mock_revenue_paid": Payment.objects.filter(status="paid").aggregate(t=Sum("amount"))["t"] or 0,
            "open_complaints": Complaint.objects.filter(status__in=["open", "in_review"]).count(),
            "top_categories": top_categories,
        })
