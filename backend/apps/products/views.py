from apps.common.viewsets import BaseModelViewSet
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from apps.products.filters import ProductFilter
from apps.common.permissions import IsSellerOrAdminOrReadOnly

class ProductViewSet(BaseModelViewSet):
    """
    ViewSet for handling Products.
    Authenticated users can create products. Admins/sellers can edit. Normal users can only perform read actions.
    Supports advanced pagination, search, ordering, and category filtering.
    """
    queryset = Product.objects.all().prefetch_related('images')
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrAdminOrReadOnly]
    filterset_class = ProductFilter
    search_fields = ['name', 'short_description', 'full_description', 'sku']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_queryset(self):
        # Admins see all products; customers/anonymous users see only active products
        base_queryset = Product.objects.all().select_related('category').prefetch_related('images')
        if self.request.user and self.request.user.is_staff:
            return base_queryset
        return base_queryset.filter(is_active=True)
