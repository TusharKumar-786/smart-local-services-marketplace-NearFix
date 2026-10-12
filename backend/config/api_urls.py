from django.urls import include, path
from rest_framework.routers import DefaultRouter

from bookings.views import AdminStatsView, BookingViewSet, ComplaintViewSet, PaymentViewSet, ReviewViewSet
from services.views import (
    AreaViewSet,
    AvailabilityViewSet,
    MyProviderProfileView,
    ProviderDashboardView,
    ProviderViewSet,
    ServiceCategoryViewSet,
)

router = DefaultRouter()
router.register("categories", ServiceCategoryViewSet, basename="category")
router.register("areas", AreaViewSet, basename="area")
router.register("providers", ProviderViewSet, basename="provider")
router.register("availability", AvailabilityViewSet, basename="availability")
router.register("bookings", BookingViewSet, basename="booking")
router.register("reviews", ReviewViewSet, basename="review")
router.register("payments", PaymentViewSet, basename="payment")
router.register("complaints", ComplaintViewSet, basename="complaint")

urlpatterns = [
    path("auth/", include("accounts.urls")),
    path("provider/profile/", MyProviderProfileView.as_view(), name="my-provider-profile"),
    path("provider/dashboard/", ProviderDashboardView.as_view(), name="provider-dashboard"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("", include(router.urls)),
]
