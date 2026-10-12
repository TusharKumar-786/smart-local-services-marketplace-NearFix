from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    message = "Only customers can do this."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "customer")


class IsProvider(BasePermission):
    message = "Only service providers can do this."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role == "provider" and hasattr(user, "provider_profile")
        )
