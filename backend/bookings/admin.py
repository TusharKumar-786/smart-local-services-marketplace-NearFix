from django.contrib import admin

from .models import Booking, Complaint, Payment, Review


class PaymentInline(admin.StackedInline):
    model = Payment
    extra = 0
    readonly_fields = ["transaction_reference"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["id", "customer", "provider", "category", "scheduled_at", "urgency", "status", "quoted_price"]
    list_filter = ["status", "urgency", "category"]
    search_fields = ["customer__email", "provider__user__email", "address"]
    list_select_related = ["customer", "provider__user", "category"]
    date_hierarchy = "scheduled_at"
    inlines = [PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["transaction_reference", "booking", "amount", "method", "status", "paid_at"]
    list_filter = ["status", "method"]
    readonly_fields = ["transaction_reference"]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["booking", "provider", "customer", "rating", "created_at"]
    list_filter = ["rating"]
    list_select_related = ["provider__user", "customer"]


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ["id", "booking", "customer", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["description", "customer__email"]
    list_editable = ["status"]
