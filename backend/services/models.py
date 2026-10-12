from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class ServiceCategory(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=40, blank=True, help_text="Icon name used by the frontend.")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "service categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Area(models.Model):
    """A locality. Areas are the nodes of the demo road graph."""

    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Road(models.Model):
    """An undirected weighted edge between two areas (demonstration data, not real roads)."""

    area_a = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="roads_from")
    area_b = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="roads_to")
    distance_km = models.DecimalField(
        max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal("0"))]
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["area_a", "area_b"], name="unique_road_pair"),
            models.CheckConstraint(check=models.Q(distance_km__gte=0), name="road_distance_non_negative"),
            models.CheckConstraint(check=~models.Q(area_a=models.F("area_b")), name="road_not_self_loop"),
        ]

    def __str__(self):
        return f"{self.area_a} - {self.area_b} ({self.distance_km} km)"


class ProviderProfile(models.Model):
    class Verification(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="provider_profile"
    )
    bio = models.TextField(blank=True)
    categories = models.ManyToManyField(ServiceCategory, related_name="providers", blank=True)
    skills = models.CharField(
        max_length=255, blank=True, help_text="Comma separated, e.g. 'split ac, gas refill'."
    )
    base_area = models.ForeignKey(
        Area, null=True, blank=True, on_delete=models.SET_NULL, related_name="based_providers"
    )
    service_areas = models.ManyToManyField(Area, related_name="serving_providers", blank=True)
    base_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=0, validators=[MinValueValidator(Decimal("0"))],
        help_text="Visit / starting price in INR.",
    )
    experience_years = models.PositiveSmallIntegerField(default=0)
    response_time_minutes = models.PositiveSmallIntegerField(
        default=60, help_text="Typical time to reach a customer."
    )
    is_available = models.BooleanField(default=True, help_text="Accepting new bookings.")
    emergency_available = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=20, choices=Verification.choices, default=Verification.PENDING
    )
    is_blocked = models.BooleanField(default=False)
    average_rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=0,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("5"))],
    )
    review_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-average_rating", "id"]
        indexes = [
            models.Index(fields=["verification_status", "is_blocked"]),
            models.Index(fields=["average_rating"]),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(base_price__gte=0), name="provider_price_non_negative"),
            models.CheckConstraint(
                check=models.Q(average_rating__gte=0) & models.Q(average_rating__lte=5),
                name="provider_rating_range",
            ),
        ]

    def __str__(self):
        return self.display_name

    @property
    def display_name(self):
        return self.user.get_full_name() or self.user.email

    @property
    def skill_list(self):
        return [s.strip().lower() for s in self.skills.split(",") if s.strip()]

    @property
    def is_bookable(self):
        return (
            self.verification_status == self.Verification.VERIFIED
            and not self.is_blocked
            and self.user.is_active
        )


class Availability(models.Model):
    """A weekly time window when the provider works, e.g. Monday 09:00-18:00."""

    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name="availability")
    weekday = models.PositiveSmallIntegerField(choices=Weekday.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ["weekday", "start_time"]
        verbose_name_plural = "availability"
        constraints = [
            models.CheckConstraint(check=models.Q(end_time__gt=models.F("start_time")), name="availability_end_after_start"),
            models.UniqueConstraint(fields=["provider", "weekday", "start_time"], name="unique_availability_start"),
        ]

    def __str__(self):
        return f"{self.provider} {self.get_weekday_display()} {self.start_time}-{self.end_time}"
