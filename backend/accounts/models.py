from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Users log in with their email address instead of a username."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        PROVIDER = "provider", "Service Provider"
        ADMIN = "admin", "Administrator"

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    phone = models.CharField(max_length=15, blank=True)
    address = models.CharField(max_length=255, blank=True)
    area = models.ForeignKey(
        "services.Area", null=True, blank=True, on_delete=models.SET_NULL, related_name="residents"
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name"]

    objects = UserManager()

    class Meta:
        indexes = [models.Index(fields=["role"])]

    def __str__(self):
        return self.email

    @property
    def is_customer(self):
        return self.role == self.Role.CUSTOMER

    @property
    def is_provider(self):
        return self.role == self.Role.PROVIDER
