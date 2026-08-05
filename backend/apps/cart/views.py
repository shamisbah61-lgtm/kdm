from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from apps.common.responses import APIResponse
from apps.cart.models import Cart, CartItem
from apps.cart.serializers import CartSerializer, AddCartItemSerializer, UpdateCartItemSerializer

class CartViewSet(viewsets.ViewSet):
    """
    ViewSet to manage the authenticated user's shopping cart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _get_cart(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    def list(self, request):
        """
        Retrieves the user's cart content.
        """
        cart = self._get_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return APIResponse(
            success=True,
            message="Cart retrieved successfully.",
            data=serializer.data
        )

    @action(detail=False, methods=['post'], url_path='add')
    def add_item(self, request):
        """
        Adds a product to the cart, or updates quantity if it exists.
        """
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cart = self._get_cart(request)
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            # Validate stock against total combined quantity
            new_qty = cart_item.quantity + quantity
            if product.quantity < new_qty:
                return APIResponse(
                    success=False,
                    message=f"Cannot add {quantity} more. Stock limit is {product.quantity}, and you already have {cart_item.quantity} in your cart.",
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = new_qty
        else:
            cart_item.quantity = quantity
            
        cart_item.save()
        cart_serializer = CartSerializer(cart, context={'request': request})
        
        return APIResponse(
            success=True,
            message="Product added to cart successfully.",
            data=cart_serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['put', 'patch'], url_path='update')
    def update_item(self, request, pk=None):
        """
        Updates the quantity of an item in the cart.
        """
        cart = self._get_cart(request)
        try:
            cart_item = CartItem.objects.get(pk=pk, cart=cart)
        except CartItem.DoesNotExist:
            return APIResponse(
                success=False,
                message="Cart item not found.",
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UpdateCartItemSerializer(data=request.data, context={'cart_item': cart_item})
        serializer.is_valid(raise_exception=True)
        
        cart_item.quantity = serializer.validated_data['quantity']
        cart_item.save()
        
        cart_serializer = CartSerializer(cart, context={'request': request})
        return APIResponse(
            success=True,
            message="Cart item quantity updated successfully.",
            data=cart_serializer.data
        )

    @action(detail=True, methods=['delete'], url_path='remove')
    def remove_item(self, request, pk=None):
        """
        Removes a specific item from the cart.
        """
        cart = self._get_cart(request)
        try:
            cart_item = CartItem.objects.get(pk=pk, cart=cart)
        except CartItem.DoesNotExist:
            return APIResponse(
                success=False,
                message="Cart item not found.",
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item.delete()
        cart_serializer = CartSerializer(cart, context={'request': request})
        return APIResponse(
            success=True,
            message="Item removed from cart successfully.",
            data=cart_serializer.data
        )

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear_cart(self, request):
        """
        Clears all items from the cart.
        """
        cart = self._get_cart(request)
        cart.items.all().delete()
        cart_serializer = CartSerializer(cart, context={'request': request})
        return APIResponse(
            success=True,
            message="Cart cleared successfully.",
            data=cart_serializer.data
        )
