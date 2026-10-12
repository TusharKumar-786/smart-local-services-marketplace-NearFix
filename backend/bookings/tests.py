from datetime import timedelta
from unittest import mock

from django.db import IntegrityError, transaction
from django.test import TestCase, TransactionTestCase
from django.utils import timezone

from accounts.models import User
from bookings.models import Booking, Payment, Review
from services.testing import client_for, future_slot, make_world


class BookingTestBase(TestCase):
    def setUp(self):
        self.w = make_world()
        self.customer = client_for(self.w.customer)
        self.provider = client_for(self.w.near.user)
        self.slot = future_slot()

    def book(self, client=None, **extra):
        data = {"provider": self.w.near.id, "category": "ac-repair", "address": "House 1, Area A",
                "scheduled_at": self.slot.isoformat(), **extra}
        return (client or self.customer).post("/api/v1/bookings/", data, format="json")

    def act(self, booking_id, action, client=None):
        return (client or self.provider).post(f"/api/v1/bookings/{booking_id}/status/", {"action": action}, format="json")


class BookingCreateTests(BookingTestBase):
    def test_create_booking_with_mock_payment(self):
        response = self.book()
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["status"], "pending")
        self.assertEqual(response.data["quoted_price"], "600.00")
        self.assertEqual(response.data["area"], "Area A")
        self.assertEqual(response.data["payment"]["status"], "pending")
        self.assertTrue(response.data["payment"]["transaction_reference"].startswith("MOCK-"))

    def test_only_customers_can_book(self):
        self.assertEqual(self.book(client=self.provider).status_code, 403)

    def test_double_booking_rejected(self):
        self.assertEqual(self.book().status_code, 201)
        second = self.book(client=client_for(self.w.other_customer))
        self.assertEqual(second.status_code, 400)
        self.assertIn("scheduled_at", second.data["errors"])

    def test_cancel_frees_slot(self):
        first = self.book().data
        self.customer.post(f"/api/v1/bookings/{first['id']}/cancel/", {}, format="json")
        self.assertEqual(self.book(client=client_for(self.w.other_customer)).status_code, 201)

    def test_validation_errors(self):
        past = timezone.localtime() - timedelta(days=1)
        self.assertIn("scheduled_at", self.book(scheduled_at=past.isoformat()).data["errors"])
        odd = self.slot + timedelta(minutes=30)
        self.assertIn("scheduled_at", self.book(scheduled_at=odd.isoformat()).data["errors"])
        late = self.slot.replace(hour=23)
        self.assertIn("scheduled_at", self.book(scheduled_at=late.isoformat()).data["errors"])
        self.assertIn("category", self.book(category="plumbing").data["errors"])
        self.assertIn("area", self.book(area="area-c").data["errors"])

    def test_unverified_or_unavailable_provider(self):
        self.w.near.verification_status = "pending"
        self.w.near.save()
        self.assertIn("provider", self.book().data["errors"])
        self.w.near.verification_status = "verified"
        self.w.near.is_available = False
        self.w.near.save()
        self.assertIn("provider", self.book().data["errors"])

    def test_emergency_requires_emergency_provider(self):
        self.w.near.emergency_available = False
        self.w.near.save()
        self.assertIn("urgency", self.book(urgency="emergency").data["errors"])

    def test_database_constraint_blocks_duplicate_active_slot(self):
        Booking.objects.create(customer=self.w.customer, provider=self.w.near, category=self.w.ac,
                               address="x", scheduled_at=self.slot, quoted_price=600)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Booking.objects.create(customer=self.w.other_customer, provider=self.w.near, category=self.w.ac,
                                   address="y", scheduled_at=self.slot, quoted_price=600)

    def test_race_condition_hits_constraint_and_returns_400(self):
        """Simulate two requests passing the slot check at the same time."""
        self.assertEqual(self.book().status_code, 201)
        with mock.patch("bookings.serializers.is_slot_free", return_value=True):
            response = self.book(client=client_for(self.w.other_customer))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Booking.objects.filter(provider=self.w.near).count(), 1)


class BookingAccessTests(BookingTestBase):
    def test_customers_see_only_own_bookings(self):
        booking_id = self.book().data["id"]
        other = client_for(self.w.other_customer)
        self.assertEqual(other.get("/api/v1/bookings/").data["count"], 0)
        self.assertEqual(other.get(f"/api/v1/bookings/{booking_id}/").status_code, 404)
        self.assertEqual(other.post(f"/api/v1/bookings/{booking_id}/cancel/").status_code, 404)

    def test_providers_see_only_assigned_bookings(self):
        booking_id = self.book().data["id"]
        far = client_for(self.w.far.user)
        self.assertEqual(far.get("/api/v1/bookings/").data["count"], 0)
        self.assertEqual(self.act(booking_id, "accept", client=far).status_code, 404)
        self.assertEqual(self.provider.get("/api/v1/bookings/").data["count"], 1)

    def test_customer_cannot_change_status(self):
        booking_id = self.book().data["id"]
        self.assertEqual(self.act(booking_id, "accept", client=self.customer).status_code, 403)

    def test_unauthenticated(self):
        from rest_framework.test import APIClient
        self.assertEqual(APIClient().get("/api/v1/bookings/").status_code, 401)


class BookingLifecycleTests(BookingTestBase):
    def test_full_lifecycle_payment_and_review(self):
        booking_id = self.book().data["id"]
        self.assertEqual(self.customer.get(f"/api/v1/bookings/{booking_id}/").data["allowed_actions"], ["cancel"])
        self.assertEqual(self.act(booking_id, "start").status_code, 400)  # must accept first
        self.assertEqual(self.act(booking_id, "accept").data["status"], "accepted")
        paid = self.customer.post(f"/api/v1/bookings/{booking_id}/pay/", {"method": "mock_upi"}, format="json")
        self.assertEqual(paid.data["payment"]["status"], "paid")
        again = self.customer.post(f"/api/v1/bookings/{booking_id}/pay/", {"method": "mock_upi"}, format="json")
        self.assertEqual(again.status_code, 400)
        self.assertEqual(self.act(booking_id, "start").data["status"], "in_progress")
        done = self.act(booking_id, "complete")
        self.assertEqual(done.data["status"], "completed")
        self.assertEqual(self.provider.get("/api/v1/provider/dashboard/").data["completed"], 1)

        review = self.customer.post("/api/v1/reviews/", {"booking": booking_id, "rating": 3, "comment": "OK"}, format="json")
        self.assertEqual(review.status_code, 201, review.data)
        self.w.near.refresh_from_db()
        self.assertEqual(self.w.near.review_count, 1)
        self.assertEqual(float(self.w.near.average_rating), 3.0)

        duplicate = self.customer.post("/api/v1/reviews/", {"booking": booking_id, "rating": 5}, format="json")
        self.assertEqual(duplicate.status_code, 400)
        self.assertEqual(Review.objects.count(), 1)

    def test_reject(self):
        booking_id = self.book().data["id"]
        self.assertEqual(self.act(booking_id, "reject").data["status"], "rejected")
        self.assertEqual(self.act(booking_id, "accept").status_code, 400)

    def test_review_requires_completed_own_booking(self):
        booking_id = self.book().data["id"]
        early = self.customer.post("/api/v1/reviews/", {"booking": booking_id, "rating": 5}, format="json")
        self.assertEqual(early.status_code, 400)
        Booking.objects.filter(pk=booking_id).update(status="completed")
        other = client_for(self.w.other_customer)
        self.assertEqual(other.post("/api/v1/reviews/", {"booking": booking_id, "rating": 5}, format="json").status_code, 400)
        bad_rating = self.customer.post("/api/v1/reviews/", {"booking": booking_id, "rating": 6}, format="json")
        self.assertEqual(bad_rating.status_code, 400)

    def test_cannot_pay_before_acceptance(self):
        booking_id = self.book().data["id"]
        response = self.customer.post(f"/api/v1/bookings/{booking_id}/pay/", {"method": "mock_card"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_cancel_paid_booking_refunds(self):
        booking_id = self.book().data["id"]
        self.act(booking_id, "accept")
        self.customer.post(f"/api/v1/bookings/{booking_id}/pay/", {"method": "mock_card"}, format="json")
        cancelled = self.customer.post(f"/api/v1/bookings/{booking_id}/cancel/", {"reason": "Plans changed"}, format="json")
        self.assertEqual(cancelled.data["status"], "cancelled")
        self.assertEqual(cancelled.data["payment"]["status"], "refunded")
        self.assertEqual(self.customer.post(f"/api/v1/bookings/{booking_id}/cancel/").status_code, 400)

    def test_cannot_cancel_completed(self):
        booking_id = self.book().data["id"]
        Booking.objects.filter(pk=booking_id).update(status="completed")
        self.assertEqual(self.customer.post(f"/api/v1/bookings/{booking_id}/cancel/").status_code, 400)

    def test_provider_cancel_accepted(self):
        booking_id = self.book().data["id"]
        self.act(booking_id, "accept")
        self.assertEqual(self.act(booking_id, "cancel").data["status"], "cancelled")


class ComplaintAndAdminTests(BookingTestBase):
    def test_complaints(self):
        booking_id = self.book().data["id"]
        short = self.customer.post("/api/v1/complaints/", {"booking": booking_id, "description": "bad"}, format="json")
        self.assertEqual(short.status_code, 400)
        ok = self.customer.post("/api/v1/complaints/", {"booking": booking_id, "description": "Technician never arrived."}, format="json")
        self.assertEqual(ok.status_code, 201)
        self.assertEqual(ok.data["status"], "open")
        other = client_for(self.w.other_customer)
        self.assertEqual(other.post("/api/v1/complaints/", {"booking": booking_id, "description": "Not my booking at all."}, format="json").status_code, 400)
        self.assertEqual(other.get("/api/v1/complaints/").data["count"], 0)
        self.assertEqual(self.provider.get("/api/v1/complaints/").status_code, 403)

    def test_admin_stats_admin_only(self):
        self.book()
        self.assertEqual(self.customer.get("/api/v1/admin/stats/").status_code, 403)
        admin = User.objects.create_superuser("admin@test.dev", "Adm1n-Pass!x", first_name="Admin")
        stats = client_for(admin).get("/api/v1/admin/stats/")
        self.assertEqual(stats.status_code, 200)
        self.assertEqual(stats.data["bookings_by_status"], {"pending": 1})

    def test_payments_scoped(self):
        self.book()
        self.assertEqual(self.customer.get("/api/v1/payments/").data["count"], 1)
        self.assertEqual(client_for(self.w.other_customer).get("/api/v1/payments/").data["count"], 0)
        self.assertEqual(self.provider.get("/api/v1/payments/").data["count"], 1)


class BookingStatusFilterTests(BookingTestBase):
    def test_comma_separated_status_filter(self):
        first = self.book()
        second = self.book(scheduled_at=future_slot(hour=12).isoformat())
        self.assertEqual(first.status_code, 201, first.data)
        self.assertEqual(second.status_code, 201, second.data)
        self.customer.post(f"/api/v1/bookings/{second.data['id']}/cancel/", {}, format="json")

        active = self.customer.get("/api/v1/bookings/?status=pending,accepted")
        self.assertEqual([b["id"] for b in active.data["results"]], [first.data["id"]])
        both = self.customer.get("/api/v1/bookings/?status=pending,cancelled")
        self.assertEqual(both.data["count"], 2)
