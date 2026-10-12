from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from services.models import Area, ProviderProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    area = serializers.SlugRelatedField(slug_field="slug", queryset=Area.objects.all(), allow_null=True, required=False)
    area_name = serializers.CharField(source="area.name", read_only=True, default=None)
    provider_profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "phone", "address",
            "area", "area_name", "role", "is_staff", "provider_profile_id", "date_joined",
        ]
        read_only_fields = ["id", "email", "role", "is_staff", "date_joined"]

    def get_provider_profile_id(self, obj):
        profile = getattr(obj, "provider_profile", None)
        return profile.id if profile else None

    def validate_phone(self, value):
        if value and (not value.replace("+", "").isdigit() or not 10 <= len(value.replace("+", "")) <= 13):
            raise serializers.ValidationError("Enter a valid phone number (10-13 digits).")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    role = serializers.ChoiceField(choices=[User.Role.CUSTOMER, User.Role.PROVIDER], default=User.Role.CUSTOMER)
    area = serializers.SlugRelatedField(slug_field="slug", queryset=Area.objects.all(), allow_null=True, required=False)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "phone", "role", "area"]
        extra_kwargs = {"first_name": {"required": True, "allow_blank": False}}

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_phone(self, value):
        return UserSerializer().validate_phone(value)

    def validate(self, attrs):
        user = User(email=attrs.get("email"), first_name=attrs.get("first_name", ""))
        try:
            validate_password(attrs["password"], user=user)
        except Exception as exc:  # django ValidationError
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        if user.role == User.Role.PROVIDER:
            ProviderProfile.objects.create(user=user, base_area=user.area)
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    default_error_messages = {"no_active_account": "Invalid email or password."}

    def validate(self, attrs):
        attrs[self.username_field] = attrs.get(self.username_field, "").strip().lower()
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        try:
            validate_password(value, user=self.context["request"].user)
        except Exception as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value
