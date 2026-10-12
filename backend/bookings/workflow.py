"""Booking lifecycle rules.

pending --accept--> accepted --start--> in_progress --complete--> completed
pending --reject--> rejected
pending/accepted --cancel--> cancelled (customer: before the slot starts;
                                       provider: an accepted booking)
"""
from django.utils import timezone

PROVIDER_TRANSITIONS = {
    "accept": ("pending", "accepted"),
    "reject": ("pending", "rejected"),
    "start": ("accepted", "in_progress"),
    "complete": ("in_progress", "completed"),
    "cancel": ("accepted", "cancelled"),
}
CUSTOMER_CANCELLABLE = ("pending", "accepted")


def allowed_actions(booking, user):
    actions = []
    if user.id == booking.customer_id:
        if booking.status in CUSTOMER_CANCELLABLE and booking.scheduled_at > timezone.now():
            actions.append("cancel")
        payment = getattr(booking, "payment", None)
        if payment and payment.status == "pending" and booking.status in ("accepted", "in_progress", "completed"):
            actions.append("pay")
        if booking.status == "completed" and not hasattr(booking, "review"):
            actions.append("review")
    elif getattr(user, "provider_profile", None) and user.provider_profile.id == booking.provider_id:
        actions.extend(name for name, (src, _) in PROVIDER_TRANSITIONS.items() if src == booking.status)
    return actions
