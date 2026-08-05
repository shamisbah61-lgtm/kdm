import django_filters
from apps.products.models import Product

class ProductFilter(django_filters.FilterSet):
    """
    Filter class for the Product model to search and filter products.
    """
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    category_slug = django_filters.CharFilter(field_name="category__slug", lookup_expr='iexact')
    category_id = django_filters.NumberFilter(field_name="category__id")

    class Meta:
        model = Product
        fields = ['category_slug', 'category_id', 'featured', 'stock_status', 'is_active']
