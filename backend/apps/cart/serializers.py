from rest_framework import serializers
from apps.cart.models import Cart, CartItem
from apps.products.models import Product
from apps.products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for items in a cart, providing detailed product details.
    """
    product = ProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'quantity', 'subtotal')


class CartSerializer(serializers.ModelSerializer):
    """
    Serializer representing the customer's full cart details.
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total_price', 'total_items_count', 'updated_at')


class AddCartItemSerializer(serializers.Serializer):
    """
    Serializer to validate and add an item to the shopping cart.
    """
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1)

    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist or is inactive.")
        return value

    def validate(self, attrs):
        product = Product.objects.get(id=attrs['product_id'])
        quantity = attrs['quantity']
        if product.quantity < quantity:
            raise serializers.ValidationError(
                {"quantity": f"Only {product.quantity} items of this product are in stock."}
            )
        attrs['product'] = product
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    """
    Serializer to validate updates to cart item quantities.
    """
    quantity = serializers.IntegerField(required=True, min_value=1)

    def validate(self, attrs):
        cart_item = self.context.get('cart_item')
        if not cart_item:
            raise serializers.ValidationError("Cart item context is required.")
        
        product = cart_item.product
        quantity = attrs['quantity']
        if product.quantity < quantity:
            raise serializers.ValidationError(
                {"quantity": f"Only {product.quantity} items are available in stock."}
            )
        return attrs
