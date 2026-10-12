"""Shared helpers for the API test suites (not used in production code)."""
from datetime import time, timedelta

from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import User
from services.models import Area, Availability, ProviderProfile, Road, ServiceCategory

PASSWORD = "Str0ng-Pass!42"


def future_slot(days=1, hour=10):
    local = timezone.localtime() + timedelta(days=days)
    return local.replace(hour=hour, minute=0, second=0, microsecond=0)


def make_provider(email, category, area, serves, price=500, rating=0, reviews=0, response=30,
                  emergency=True, verified=True, blocked=False, skills="", first_name=None):
    user = User.objects.create_user(email, PASSWORD, first_name=first_name or email.split("@")[0].title(),
                                    role="provider", area=area)
    profile = ProviderProfile.objects.create(
        user=user, base_area=area, base_price=price, average_rating=rating, review_count=reviews,
        response_time_minutes=response, emergency_available=emergency, skills=skills,
        verification_status="verified" if verified else "pending", is_blocked=blocked,
    )
    profile.categories.add(category)
    profile.service_areas.set(serves)
    for day in range(7):
        Availability.objects.create(provider=profile, weekday=day, start_time=time(7, 0), end_time=time(22, 0))
    return profile


def make_world():
    """Small world: 4 areas in a line (A-B-C-D) + isolated E, AC Repair category."""
    w = type("World", (), {})()
    w.ac = ServiceCategory.objects.create(name="AC Repair", slug="ac-repair")
    w.plumbing = ServiceCategory.objects.create(name="Plumbing", slug="plumbing")
    w.a, w.b, w.c, w.d, w.e = (Area.objects.create(name=n) for n in ["Area A", "Area B", "Area C", "Area D", "Area E"])
    Road.objects.create(area_a=w.a, area_b=w.b, distance_km=2)
    Road.objects.create(area_a=w.b, area_b=w.c, distance_km=3)
    Road.objects.create(area_a=w.c, area_b=w.d, distance_km=4)
    w.customer = User.objects.create_user("cust@test.dev", PASSWORD, first_name="Cust", role="customer",
                                          area=w.a, phone="9876543210")
    w.other_customer = User.objects.create_user("other@test.dev", PASSWORD, first_name="Other", role="customer", area=w.a)
    w.near = make_provider("near@test.dev", w.ac, w.a, [w.a, w.b], price=600, rating=4.5, reviews=10, skills="split ac")
    w.far = make_provider("far@test.dev", w.ac, w.d, [w.a, w.d], price=600, rating=4.5, reviews=10)
    return w


def client_for(user):
    client = APIClient()
    client.force_authenticate(user)
    return client
