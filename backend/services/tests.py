from django.test import TestCase
from rest_framework.test import APIClient

from services.testing import client_for, future_slot, make_provider, make_world


class CategoryAndProviderApiTests(TestCase):
    def setUp(self):
        self.w = make_world()
        self.client = APIClient()

    def test_categories_public_with_counts(self):
        response = self.client.get("/api/v1/categories/")
        self.assertEqual(response.status_code, 200)
        counts = {c["slug"]: c["provider_count"] for c in response.data}
        self.assertEqual(counts["ac-repair"], 2)

    def test_provider_list_hides_unverified_and_blocked(self):
        make_provider("pending@test.dev", self.w.ac, self.w.a, [self.w.a], verified=False)
        make_provider("blocked@test.dev", self.w.ac, self.w.a, [self.w.a], blocked=True)
        response = self.client.get("/api/v1/providers/")
        self.assertEqual(response.data["count"], 2)

    def test_provider_filters(self):
        cheap = make_provider("cheap@test.dev", self.w.plumbing, self.w.b, [self.w.b], price=200, rating=3)
        self.assertEqual(self.client.get("/api/v1/providers/", {"category": "plumbing"}).data["results"][0]["id"], cheap.id)
        self.assertEqual(self.client.get("/api/v1/providers/", {"max_price": 300}).data["count"], 1)
        self.assertEqual(self.client.get("/api/v1/providers/", {"min_rating": 4}).data["count"], 2)
        self.assertEqual(self.client.get("/api/v1/providers/", {"area": "area-d"}).data["count"], 1)

    def test_provider_detail_and_slots(self):
        detail = self.client.get(f"/api/v1/providers/{self.w.near.id}/")
        self.assertEqual(len(detail.data["availability"]), 7)
        day = future_slot().date().isoformat()
        slots = self.client.get(f"/api/v1/providers/{self.w.near.id}/slots/", {"date": day}).data["slots"]
        self.assertEqual(len(slots), 15)  # 07:00 .. 21:00
        self.assertEqual(self.client.get(f"/api/v1/providers/{self.w.near.id}/slots/", {"date": "bad"}).status_code, 400)


class ProviderSelfServiceTests(TestCase):
    def setUp(self):
        self.w = make_world()
        self.provider_client = client_for(self.w.near.user)

    def test_customer_cannot_use_provider_endpoints(self):
        client = client_for(self.w.customer)
        self.assertEqual(client.get("/api/v1/provider/profile/").status_code, 403)
        self.assertEqual(client.get("/api/v1/availability/").status_code, 403)

    def test_provider_updates_profile_but_not_verification(self):
        response = self.provider_client.patch("/api/v1/provider/profile/", {
            "base_price": "750.00", "categories": ["ac-repair", "plumbing"], "verification_status": "verified",
            "average_rating": "5.00"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.w.near.refresh_from_db()
        self.assertEqual(float(self.w.near.base_price), 750.0)
        self.assertEqual(float(self.w.near.average_rating), 4.5)

    def test_invalid_price_rejected(self):
        response = self.provider_client.patch("/api/v1/provider/profile/", {"base_price": "0"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_availability_crud_and_overlap(self):
        self.w.near.availability.all().delete()
        created = self.provider_client.post("/api/v1/availability/", {"weekday": 0, "start_time": "09:00", "end_time": "13:00"})
        self.assertEqual(created.status_code, 201)
        overlap = self.provider_client.post("/api/v1/availability/", {"weekday": 0, "start_time": "12:00", "end_time": "15:00"})
        self.assertEqual(overlap.status_code, 400)
        backwards = self.provider_client.post("/api/v1/availability/", {"weekday": 1, "start_time": "15:00", "end_time": "12:00"})
        self.assertEqual(backwards.status_code, 400)
        other = client_for(self.w.far.user)
        self.assertEqual(other.delete(f"/api/v1/availability/{created.data['id']}/").status_code, 404)
        self.assertEqual(self.provider_client.delete(f"/api/v1/availability/{created.data['id']}/").status_code, 204)

    def test_dashboard(self):
        response = self.provider_client.get("/api/v1/provider/dashboard/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["completed"], 0)
