from django.contrib import admin

from .models import Area, Availability, ProviderProfile, Road, ServiceCategory


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active"]
    list_filter = ["is_active"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]


@admin.register(Road)
class RoadAdmin(admin.ModelAdmin):
    list_display = ["area_a", "area_b", "distance_km"]
    list_select_related = ["area_a", "area_b"]


class AvailabilityInline(admin.TabularInline):
    model = Availability
    extra = 0


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ["display_name", "verification_status", "is_blocked", "base_area", "base_price", "average_rating", "review_count"]
    list_filter = ["verification_status", "is_blocked", "emergency_available", "categories"]
    search_fields = ["user__email", "user__first_name", "user__last_name", "skills"]
    list_select_related = ["user", "base_area"]
    filter_horizontal = ["categories", "service_areas"]
    readonly_fields = ["average_rating", "review_count", "created_at", "updated_at"]
    inlines = [AvailabilityInline]
    actions = ["verify", "reject", "block", "unblock"]

    @admin.action(description="Verify selected providers")
    def verify(self, request, queryset):
        for p in queryset:
            p.verification_status = ProviderProfile.Verification.VERIFIED
            p.save()

    @admin.action(description="Reject selected providers")
    def reject(self, request, queryset):
        for p in queryset:
            p.verification_status = ProviderProfile.Verification.REJECTED
            p.save()

    @admin.action(description="Block selected providers")
    def block(self, request, queryset):
        for p in queryset:
            p.is_blocked = True
            p.save()

    @admin.action(description="Unblock selected providers")
    def unblock(self, request, queryset):
        for p in queryset:
            p.is_blocked = False
            p.save()
