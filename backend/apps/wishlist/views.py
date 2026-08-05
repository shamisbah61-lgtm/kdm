from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from apps.common.responses import APIResponse
from apps.wishlist.models import Wishlist
from apps.wishlist.serializers import WishlistSerializer, AddWishlistSerializer

class WishlistViewSet(viewsets.ViewSet):
    """
    ViewSet to manage the authenticated user's wishlist.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """
        Lists all products saved in the user's wishlist.
        """
        queryset = Wishlist.objects.filter(user=request.user).select_related('product')
        serializer = WishlistSerializer(queryset, many=True, context={'request': request})
        return APIResponse(
            success=True,
            message="Wishlist retrieved successfully.",
            data=serializer.data
        )

    def create(self, request):
        """
        Adds a product to the user's wishlist.
        """
        serializer = AddWishlistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product = serializer.validated_data['product']
        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        
        if not created:
            return APIResponse(
                success=True,
                message="Product is already in your wishlist.",
                data=WishlistSerializer(wishlist_item, context={'request': request}).data
            )
            
        return APIResponse(
            success=True,
            message="Product added to wishlist successfully.",
            data=WishlistSerializer(wishlist_item, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    def destroy(self, request, pk=None):
        """
        Removes a product from the user's wishlist using the wishlist entry ID.
        """
        try:
            wishlist_item = Wishlist.objects.get(pk=pk, user=request.user)
        except Wishlist.DoesNotExist:
            return APIResponse(
                success=False,
                message="Wishlist entry not found.",
                status=status.HTTP_404_NOT_FOUND
            )
            
        wishlist_item.delete()
        return APIResponse(
            success=True,
            message="Product removed from wishlist successfully."
        )

    @action(detail=False, methods=['delete'], url_path='remove-product/(?P<product_id>[0-9]+)')
    def remove_by_product_id(self, request, product_id=None):
        """
        Toggles or removes a product from the wishlist using the product ID.
        """
        try:
            wishlist_item = Wishlist.objects.get(user=request.user, product_id=product_id)
        except Wishlist.DoesNotExist:
            return APIResponse(
                success=False,
                message="Product is not in your wishlist.",
                status=status.HTTP_404_NOT_FOUND
            )
            
        wishlist_item.delete()
        return APIResponse(
            success=True,
            message="Product removed from wishlist successfully."
        )
