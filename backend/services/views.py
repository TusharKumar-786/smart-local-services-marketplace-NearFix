from datetime import date

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsProvider

from .filters import ProviderFilter
from .models import Area, ProviderProfile, ServiceCategory
from .serializers import (
    AreaSerializer,
    AvailabilitySerializer,
    MyProviderProfileSerializer,
    ProviderDetailSerializer,
    ProviderListSerializer,
    ServiceCategorySerializer,
)
from .slots import free_slots_on


def bookable_providers():
    return ProviderProfile.objects.filter(
        verification_status=ProviderProfile.Verification.VERIFIED, is_blocked=False, user__is_active=True
    )


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    lookup_field = "slug"

    def get_queryset(self):
        verified = Q(
            providers__verification_status=ProviderProfile.Verification.VERIFIED,
            providers__is_blocked=False,
        )
        return ServiceCategory.objects.filter(is_active=True).annotate(provider_count=Count("providers", filter=verified))


class AreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    lookup_field = "slug"


class ProviderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    filterset_class = ProviderFilter
    search_fields = ["user__first_name", "user__last_name", "skills", "categories__name"]
    ordering_fields = ["average_rating", "base_price", "experience_years", "review_count"]
    ordering = ["-average_rating", "id"]

    def get_queryset(self):
        return (
            bookable_providers()
            .select_related("user", "base_area")
            .prefetch_related("categories", "service_areas", "availability")
            .distinct()
        )

    def get_serializer_class(self):
        return ProviderDetailSerializer if self.action == "retrieve" else ProviderListSerializer

    @action(detail=True, methods=["get"])
    def reviews(self, request, pk=None):
        from bookings.serializers import ReviewSerializer

        provider = self.get_object()
        queryset = provider.reviews.select_related("customer").order_by("-created_at")
        page = self.paginate_queryset(queryset)
        return self.get_paginated_response(ReviewSerializer(page, many=True).data)

    @action(detail=True, methods=["get"])
    def slots(self, request, pk=None):
        provider = self.get_object()
        try:
            day = date.fromisoformat(request.query_params.get("date", ""))
        except ValueError:
            raise ValidationError({"date": ["Use the format YYYY-MM-DD."]})
        if day < timezone.localdate():
            raise ValidationError({"date": ["Date cannot be in the past."]})
        return Response({"date": day, "slots": [s.isoformat() for s in free_slots_on(provider, day)]})


class MyProviderProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = MyProviderProfileSerializer
    permission_classes = [IsProvider]
    http_method_names = ["get", "patch"]

    def get_object(self):
        return self.request.user.provider_profile


class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [IsProvider]
    pagination_class = None

    def get_queryset(self):
        return self.request.user.provider_profile.availability.all()

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user.provider_profile)


class ProviderDashboardView(APIView):
    permission_classes = [IsProvider]

    def get(self, request):
        from bookings.models import Booking

        provider = request.user.provider_profile
        bookings = Booking.objects.filter(provider=provider)
        completed = bookings.filter(status=Booking.Status.COMPLETED)
        now = timezone.now()
        month_start = timezone.localtime(now).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return Response({
            "pending_requests": bookings.filter(status=Booking.Status.PENDING).count(),
            "upcoming": bookings.filter(
                status__in=[Booking.Status.ACCEPTED, Booking.Status.IN_PROGRESS], scheduled_at__gte=now
            ).count(),
            "completed": completed.count(),
            "total_earnings": completed.aggregate(total=Sum("quoted_price"))["total"] or 0,
            "earnings_this_month": completed.filter(scheduled_at__gte=month_start).aggregate(
                total=Sum("quoted_price"))["total"] or 0,
            "average_rating": provider.average_rating,
            "review_count": provider.review_count,
            "verification_status": provider.verification_status,
        })
