from rest_framework import permissions, status
from apps.common.viewsets import BaseModelViewSet
from apps.common.responses import APIResponse
from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer

class ReviewViewSet(BaseModelViewSet):
    """
    ViewSet to manage product reviews.
    Anonymous read actions are allowed; write actions require authentication.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        # Allow anyone to read reviews, require auth to write
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Enable filtering reviews by product parameter (e.g. ?product=5)
        queryset = Review.objects.all().select_related('user', 'product')
        product_id = self.request.query_params.get('product')
        if product_id:
            return queryset.filter(product_id=product_id)
        return queryset
