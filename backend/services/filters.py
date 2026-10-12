import django_filters

from .models import ProviderProfile


class ProviderFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="categories__slug")
    area = django_filters.CharFilter(field_name="service_areas__slug")
    min_rating = django_filters.NumberFilter(field_name="average_rating", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="lte")
    emergency = django_filters.BooleanFilter(field_name="emergency_available")

    class Meta:
        model = ProviderProfile
        fields = ["category", "area", "min_rating", "max_price", "emergency"]
