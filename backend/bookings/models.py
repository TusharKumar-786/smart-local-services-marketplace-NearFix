from decimal import Decimal

import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from services.models import Area, ProviderProfile, ServiceCategory

# Bookings in these states occupy the provider's time slot.
ACTIVE_STATUSES = ("pending", "accepted", "in_progress")


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class Urgency(models.TextChoices):
        NORMAL = "normal", "Normal"
        URGENT = "urgent", "Urgent"
        EMERGENCY = "emergency", "Emergency"

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="bookings")
    provider = models.ForeignKey(ProviderProfile, on_delete=models.PROTECT, related_name="bookings")
    category = models.ForeignKey(ServiceCategory, on_delete=models.PROTECT, related_name="bookings")
    area = models.ForeignKey(Area, null=True, blank=True, on_delete=models.SET_NULL, related_name="bookings")
    address = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    scheduled_at = models.DateTimeField(help_text="Start of the one-hour service slot.")
    urgency = models.CharField(max_length=20, choices=Urgency.choices, default=Urgency.NORMAL)
    quoted_price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    match_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    cancellation_reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_at", "-id"]
        indexes = [
            models.Index(fields=["customer", "status"]),
            models.Index(fields=["provider", "status"]),
            models.Index(fields=["scheduled_at"]),
        ]
        constraints = [
            # Database-level double booking guard: a provider can have only one
            # active booking per slot. Cancelled/rejected/completed bookings are
            # ignored, so cancelling frees the slot again.
            models.UniqueConstraint(
                fields=["provider", "scheduled_at"],
                condition=models.Q(status__in=ACTIVE_STATUSES),
                name="unique_active_booking_per_slot",
            ),
            models.CheckConstraint(check=models.Q(quoted_price__gte=0), name="booking_price_non_negative"),
        ]

    def __str__(self):
        return f"Booking #{self.pk} - {self.category} with {self.provider}"


class Payment(models.Model):
    """Mock payment tracking. No real money is processed."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        REFUNDED = "refunded", "Refunded"
        FAILED = "failed", "Failed"

    class Method(models.TextChoices):
        CASH = "cash", "Cash after service"
        MOCK_UPI = "mock_upi", "UPI (mock)"
        MOCK_CARD = "mock_card", "Card (mock)"

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")
    amount = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.CASH)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    transaction_reference = models.CharField(max_length=40, unique=True, editable=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def save(self, *args, **kwargs):
        if not self.transaction_reference:
            self.transaction_reference = f"MOCK-{uuid.uuid4().hex[:16].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_reference} ({self.status})"


class Review(models.Model):
    # OneToOne on booking: a booking can be reviewed only once.
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="review")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(check=models.Q(rating__gte=1) & models.Q(rating__lte=5), name="review_rating_range"),
        ]

    def __str__(self):
        return f"{self.rating}/5 for {self.provider}"


class Complaint(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_REVIEW = "in_review", "In review"
        RESOLVED = "resolved", "Resolved"
        REJECTED = "rejected", "Rejected"

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="complaints")
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="complaints")
    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    resolution_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Complaint #{self.pk} on booking #{self.booking_id}"
