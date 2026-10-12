from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from services.models import ProviderProfile
from services.testing import PASSWORD, client_for, make_world


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def register(self, **extra):
        data = {"email": "New@Test.dev", "password": PASSWORD, "first_name": "New", **extra}
        return self.client.post("/api/v1/auth/register/", data, format="json")

    def test_register_customer_returns_tokens(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["email"], "new@test.dev")
        self.assertEqual(response.data["user"]["role"], "customer")
        self.assertIn("access", response.data)
        self.assertTrue(User.objects.get(email="new@test.dev").password.startswith("pbkdf2_"))

    def test_register_provider_creates_pending_profile(self):
        response = self.register(role="provider")
        self.assertEqual(response.status_code, 201)
        profile = ProviderProfile.objects.get(user__email="new@test.dev")
        self.assertEqual(profile.verification_status, "pending")

    def test_cannot_register_as_admin(self):
        self.assertEqual(self.register(role="admin").status_code, 400)

    def test_duplicate_email_case_insensitive(self):
        self.register()
        response = self.register(email="NEW@test.DEV")
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data["errors"])

    def test_weak_password(self):
        response = self.register(password="123")
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data["errors"])

    def test_login_me_logout(self):
        self.register()
        login = self.client.post("/api/v1/auth/login/", {"email": "NEW@test.dev", "password": PASSWORD}, format="json")
        self.assertEqual(login.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        self.assertEqual(self.client.get("/api/v1/auth/me/").data["email"], "new@test.dev")
        self.assertEqual(self.client.post("/api/v1/auth/logout/", {"refresh": login.data["refresh"]}, format="json").status_code, 205)
        refresh = self.client.post("/api/v1/auth/token/refresh/", {"refresh": login.data["refresh"]}, format="json")
        self.assertEqual(refresh.status_code, 401)

    def test_wrong_password(self):
        self.register()
        response = self.client.post("/api/v1/auth/login/", {"email": "new@test.dev", "password": "wrong"}, format="json")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["detail"], "Invalid email or password.")

    def test_me_requires_auth(self):
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 401)

    def test_update_profile_cannot_change_role(self):
        w = make_world()
        client = client_for(w.customer)
        response = client.patch("/api/v1/auth/me/", {"phone": "9999988888", "role": "admin", "area": "area-b"}, format="json")
        self.assertEqual(response.status_code, 200)
        w.customer.refresh_from_db()
        self.assertEqual((w.customer.role, w.customer.phone, w.customer.area.slug), ("customer", "9999988888", "area-b"))

    def test_change_password(self):
        w = make_world()
        client = client_for(w.customer)
        bad = client.post("/api/v1/auth/change-password/", {"current_password": "x", "new_password": "An0ther-Pass!9"})
        self.assertEqual(bad.status_code, 400)
        ok = client.post("/api/v1/auth/change-password/", {"current_password": PASSWORD, "new_password": "An0ther-Pass!9"})
        self.assertEqual(ok.status_code, 200)
