from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = ["email", "first_name", "last_name", "role", "is_active", "is_staff", "date_joined"]
    list_filter = ["role", "is_active", "is_staff"]
    search_fields = ["email", "first_name", "last_name", "phone"]
    actions = ["block_users", "unblock_users"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "phone", "address", "area", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "first_name", "role", "password1", "password2")}),)

    @admin.action(description="Block selected users (deactivate login)")
    def block_users(self, request, queryset):
        queryset.update(is_active=False)

    @admin.action(description="Unblock selected users")
    def unblock_users(self, request, queryset):
        queryset.update(is_active=True)
