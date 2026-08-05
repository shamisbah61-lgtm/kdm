from apps.common.viewsets import BaseModelViewSet
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from apps.common.permissions import IsAdminOrReadOnly

class CategoryViewSet(BaseModelViewSet):
    """
    ViewSet for handling Categories.
    Admins can execute all CRUD actions; normal users can only perform read actions.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        # Admins see all categories; customers/anonymous users see only active categories
        if self.request.user and self.request.user.is_staff:
            return Category.objects.all()
        return Category.objects.filter(is_active=True)
