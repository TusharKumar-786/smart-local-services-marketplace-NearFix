"""Time-slot helpers. Every booking occupies a one-hour slot starting on the hour."""
from datetime import datetime, time, timedelta

from django.utils import timezone

SLOT_HOURS = 1
SEARCH_WINDOW_HOURS = 72


def _active_booking_starts(provider, start, end):
    from bookings.models import ACTIVE_STATUSES, Booking

    return set(
        Booking.objects.filter(
            provider=provider, status__in=ACTIVE_STATUSES, scheduled_at__gte=start, scheduled_at__lt=end
        ).values_list("scheduled_at", flat=True)
    )


def is_within_working_hours(provider, start):
    """True if [start, start + 1h] fits inside one of the provider's weekly windows (same day)."""
    local = timezone.localtime(start)
    end_local = local + timedelta(hours=SLOT_HOURS)
    if end_local.date() != local.date():
        return False
    for window in provider.availability.all():
        if (
            window.weekday == local.weekday()
            and window.start_time <= local.time()
            and window.end_time >= end_local.time()
        ):
            return True
    return False


def is_slot_free(provider, start, booked=None):
    if start.minute or start.second or start.microsecond:
        return False
    if not is_within_working_hours(provider, start):
        return False
    if booked is None:
        booked = _active_booking_starts(provider, start, start + timedelta(hours=SLOT_HOURS))
    return start not in booked


def next_free_slot(provider, now=None, window_hours=SEARCH_WINDOW_HOURS):
    """First free one-hour slot starting at the next full hour, or None."""
    now = now or timezone.now()
    local_now = timezone.localtime(now)
    candidate = local_now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    end = candidate + timedelta(hours=window_hours)
    booked = _active_booking_starts(provider, candidate, end)
    while candidate < end:
        if is_slot_free(provider, candidate, booked):
            return candidate
        candidate += timedelta(hours=1)
    return None


def free_slots_on(provider, day):
    """All free hourly slots on a given date (future slots only)."""
    tz = timezone.get_current_timezone()
    start = timezone.make_aware(datetime.combine(day, time(0, 0)), tz)
    end = start + timedelta(days=1)
    booked = _active_booking_starts(provider, start, end)
    now = timezone.now()
    slots, candidate = [], start
    while candidate < end:
        if candidate > now and is_slot_free(provider, candidate, booked):
            slots.append(candidate)
        candidate += timedelta(hours=1)
    return slots
