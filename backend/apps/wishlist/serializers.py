from rest_framework import serializers
from apps.wishlist.models import Wishlist
from apps.products.models import Product
from apps.products.serializers import ProductSerializer

class WishlistSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieved wishlist items, displaying detailed product details.
    """
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'product', 'created_at')


class AddWishlistSerializer(serializers.Serializer):
    """
    Serializer to validate adding a product to the user's wishlist.
    """
    product_id = serializers.IntegerField(required=True)

    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist or is inactive.")
        return value

    def validate(self, attrs):
        attrs['product'] = Product.objects.get(id=attrs['product_id'])
        return attrs
