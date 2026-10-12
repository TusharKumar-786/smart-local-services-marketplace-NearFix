"""Create realistic development data: categories, areas, a demo road graph,
providers with availability, customers, and past completed bookings with reviews.

Usage:  python manage.py seed_nearfix
Safe to run more than once (existing records are reused).
All passwords below are for LOCAL DEVELOPMENT only.
"""
from datetime import time, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from bookings.models import Booking, Payment, Review
from services.models import Area, Availability, ProviderProfile, Road, ServiceCategory

DEMO_PASSWORD = "Nearfix@123"

CATEGORIES = [
    ("Plumbing", "plumbing", "Leaks, taps, pipelines, water tanks and bathroom fittings.", "droplet"),
    ("Electrical", "electrical", "Wiring, switchboards, fans, lights and inverter installation.", "bolt"),
    ("AC Repair", "ac-repair", "AC servicing, gas refill, installation and cooling problems.", "snowflake"),
    ("Painting", "painting", "Interior and exterior painting, waterproofing and texture work.", "brush"),
    ("Carpentry", "carpentry", "Furniture repair, doors, locks, cabinets and modular fittings.", "hammer"),
    ("Home Cleaning", "home-cleaning", "Deep cleaning, kitchen, bathroom and sofa cleaning.", "sparkle"),
    ("Appliance Repair", "appliance-repair", "Washing machine, fridge, microwave and geyser repair.", "plug"),
]

# Demo road network (NOT real road data). Banur is deliberately disconnected
# so the app can demonstrate an unreachable area.
AREAS = ["Sector 70", "Phase 7", "Sector 62", "Phase 3B2", "Kharar", "Landran", "Zirakpur", "Sector 82", "Banur"]
ROADS = [
    ("Sector 70", "Phase 7", 2.5), ("Sector 70", "Sector 62", 3.0), ("Phase 7", "Phase 3B2", 2.0),
    ("Sector 62", "Phase 3B2", 4.0), ("Sector 70", "Sector 82", 4.5), ("Sector 82", "Landran", 5.0),
    ("Sector 70", "Kharar", 9.0), ("Landran", "Kharar", 6.0), ("Phase 3B2", "Zirakpur", 12.0),
    ("Sector 62", "Zirakpur", 10.0),
]

# name, email, categories, skills, base area, service areas, price, exp, response, emergency, schedule
PROVIDERS = [
    ("Raj Kumar", "raj@nearfix.dev", ["ac-repair"], "split ac, window ac, gas refill, installation", "Sector 70",
     ["Sector 70", "Phase 7", "Sector 62", "Sector 82"], 600, 8, 20, True, "full"),
    ("Aman Singh", "aman@nearfix.dev", ["ac-repair", "appliance-repair"], "split ac, gas refill, fridge", "Phase 7",
     ["Phase 7", "Sector 70", "Phase 3B2"], 700, 6, 30, True, "full"),
    ("Ravi Kumar", "ravi@nearfix.dev", ["ac-repair"], "window ac, servicing", "Kharar",
     ["Kharar", "Landran", "Sector 70"], 450, 4, 60, False, "day"),
    ("Simran Kaur", "simran@nearfix.dev", ["ac-repair", "electrical"], "split ac, inverter, wiring", "Sector 62",
     ["Sector 62", "Sector 70", "Phase 3B2", "Zirakpur"], 1200, 10, 25, True, "full"),
    ("Harpreet Gill", "harpreet@nearfix.dev", ["plumbing"], "leak repair, tap fitting, water tank", "Sector 70",
     ["Sector 70", "Phase 7", "Sector 82"], 350, 7, 25, True, "full"),
    ("Mohit Sharma", "mohit@nearfix.dev", ["plumbing"], "pipeline, bathroom fitting, geyser", "Phase 3B2",
     ["Phase 3B2", "Phase 7", "Sector 62"], 400, 5, 40, False, "day"),
    ("Gurdeep Singh", "gurdeep@nearfix.dev", ["plumbing", "carpentry"], "leak repair, door repair", "Landran",
     ["Landran", "Sector 82", "Kharar"], 300, 3, 45, True, "full"),
    ("Neha Verma", "neha@nearfix.dev", ["electrical"], "wiring, switchboard, fan installation", "Sector 70",
     ["Sector 70", "Sector 62", "Phase 7"], 300, 6, 30, True, "full"),
    ("Arjun Mehta", "arjun@nearfix.dev", ["electrical"], "inverter, lighting, mcb", "Zirakpur",
     ["Zirakpur", "Sector 62"], 350, 9, 50, False, "day"),
    ("Pooja Rani", "pooja@nearfix.dev", ["home-cleaning"], "deep cleaning, kitchen, sofa", "Phase 7",
     ["Phase 7", "Sector 70", "Phase 3B2"], 900, 4, 90, False, "day"),
    ("Karan Malhotra", "karan@nearfix.dev", ["painting"], "interior, waterproofing, texture", "Sector 82",
     ["Sector 82", "Sector 70", "Landran"], 1500, 12, 120, False, "day"),
    ("Vikram Thakur", "vikram@nearfix.dev", ["carpentry"], "furniture repair, locks, cabinets", "Sector 62",
     ["Sector 62", "Sector 70"], 400, 8, 60, False, "day"),
    ("Deepak Yadav", "deepak@nearfix.dev", ["appliance-repair"], "washing machine, microwave, fridge", "Kharar",
     ["Kharar", "Sector 70", "Landran"], 500, 5, 45, True, "full"),
    # Shown in admin but NOT in search: pending verification and blocked.
    ("Sunil Pending", "sunil@nearfix.dev", ["ac-repair"], "split ac", "Sector 70", ["Sector 70"], 400, 2, 30, True, "full"),
    ("Blocked Provider", "blocked@nearfix.dev", ["plumbing"], "leak repair", "Sector 70", ["Sector 70"], 250, 1, 15, True, "full"),
]

CUSTOMERS = [
    ("Tushar", "Kumar", "customer@nearfix.dev", "Sector 70", "9876500001"),
    ("Amanat", "Rana", "amanat@nearfix.dev", "Phase 7", "9876500002"),
    ("Preeti", "Raj", "preeti@nearfix.dev", "Sector 62", "9876500003"),
]

# provider email -> list of (customer email, rating, comment) for past completed jobs
REVIEWS = {
    "raj@nearfix.dev": [("customer@nearfix.dev", 5, "Fixed the AC within an hour."), ("amanat@nearfix.dev", 5, "Very professional."), ("preeti@nearfix.dev", 4, "Good work, slightly late.")],
    "aman@nearfix.dev": [("customer@nearfix.dev", 5, "Gas refill done properly."), ("preeti@nearfix.dev", 4, "Polite and quick.")],
    "ravi@nearfix.dev": [("amanat@nearfix.dev", 5, "Cheap and good."), ("customer@nearfix.dev", 4, "Decent service.")],
    "simran@nearfix.dev": [("preeti@nearfix.dev", 5, "Expert technician.")],
    "harpreet@nearfix.dev": [("customer@nearfix.dev", 5, "Leak fixed fast."), ("amanat@nearfix.dev", 4, "Good.")],
    "mohit@nearfix.dev": [("preeti@nearfix.dev", 3, "Okay work.")],
    "neha@nearfix.dev": [("customer@nearfix.dev", 5, "Rewired the whole room neatly.")],
    "pooja@nearfix.dev": [("amanat@nearfix.dev", 4, "House is spotless.")],
    "deepak@nearfix.dev": [("customer@nearfix.dev", 4, "Washing machine works again.")],
}


class Command(BaseCommand):
    help = "Seed the database with Nearfix development data."

    @transaction.atomic
    def handle(self, *args, **options):
        categories = {}
        for name, slug, description, icon in CATEGORIES:
            categories[slug], _ = ServiceCategory.objects.update_or_create(
                slug=slug, defaults={"name": name, "description": description, "icon": icon, "is_active": True}
            )

        areas = {name: Area.objects.get_or_create(name=name)[0] for name in AREAS}
        for a, b, km in ROADS:
            Road.objects.update_or_create(area_a=areas[a], area_b=areas[b], defaults={"distance_km": km})

        if not User.objects.filter(email="admin@nearfix.dev").exists():
            User.objects.create_superuser("admin@nearfix.dev", DEMO_PASSWORD, first_name="Admin")

        customers = {}
        for first, last, email, area, phone in CUSTOMERS:
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create_user(email, DEMO_PASSWORD, first_name=first, last_name=last,
                                                role="customer", area=areas[area], phone=phone,
                                                address=f"House 12, {area}, Mohali")
            customers[email] = user

        providers = {}
        for i, (name, email, cats, skills, base, serves, price, exp, response, emergency, schedule) in enumerate(PROVIDERS):
            first, last = name.split(" ", 1)
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create_user(email, DEMO_PASSWORD, first_name=first, last_name=last,
                                                role="provider", area=areas[base], phone=f"98140{i:05d}")
            status = "pending" if email == "sunil@nearfix.dev" else "verified"
            profile, _ = ProviderProfile.objects.update_or_create(user=user, defaults={
                "bio": f"{exp} years of experience in {', '.join(categories[c].name for c in cats)} around {base}.",
                "skills": skills, "base_area": areas[base], "base_price": price, "experience_years": exp,
                "response_time_minutes": response, "emergency_available": emergency, "is_available": True,
                "verification_status": status, "is_blocked": "blocked" in email,
            })
            profile.categories.set([categories[c] for c in cats])
            profile.service_areas.set([areas[a] for a in serves])
            if not profile.availability.exists():
                start, end = (time(7, 0), time(22, 0)) if schedule == "full" else (time(9, 0), time(18, 0))
                Availability.objects.bulk_create(
                    Availability(provider=profile, weekday=d, start_time=start, end_time=end) for d in range(7)
                )
            providers[email] = profile

        # Past completed bookings + reviews, so ratings come from real review rows.
        base_time = timezone.localtime().replace(hour=11, minute=0, second=0, microsecond=0)
        for p_email, reviews in REVIEWS.items():
            provider = providers[p_email]
            for n, (c_email, rating, comment) in enumerate(reviews, start=1):
                customer = customers[c_email]
                if Review.objects.filter(provider=provider, customer=customer).exists():
                    continue
                booking = Booking.objects.create(
                    customer=customer, provider=provider, category=provider.categories.first(),
                    area=customer.area, address=customer.address, description="Seeded past job",
                    scheduled_at=base_time - timedelta(days=7 * n + provider.id), quoted_price=provider.base_price,
                    status=Booking.Status.COMPLETED,
                )
                Payment.objects.create(booking=booking, amount=booking.quoted_price, method="cash",
                                       status="paid", paid_at=booking.scheduled_at + timedelta(hours=1))
                Review.objects.create(booking=booking, customer=customer, provider=provider,
                                      rating=rating, comment=comment)

        self.stdout.write(self.style.SUCCESS("Nearfix seed data ready."))
        self.stdout.write(f"Demo password for every account: {DEMO_PASSWORD}  (development only)")
        self.stdout.write("  Admin:    admin@nearfix.dev   -> http://127.0.0.1:8000/admin/")
        self.stdout.write("  Customer: customer@nearfix.dev")
        self.stdout.write("  Provider: raj@nearfix.dev")
