from django.db.models import Avg, Count
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Review


@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def update_provider_rating(sender, instance, **kwargs):
    provider = instance.provider
    stats = provider.reviews.aggregate(avg=Avg("rating"), count=Count("id"))
    provider.average_rating = round(stats["avg"] or 0, 2)
    provider.review_count = stats["count"]
    provider.save(update_fields=["average_rating", "review_count", "updated_at"])
