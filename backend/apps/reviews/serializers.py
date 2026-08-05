from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from apps.reviews.models import Review
from apps.orders.models import OrderItem
from apps.accounts.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieved product reviews, displaying reviewer info and verified purchase status.
    """
    user = UserSerializer(read_only=True)
    verified_purchase = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ('id', 'user', 'product', 'rating', 'comment', 'verified_purchase', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def get_verified_purchase(self, obj):
        """
        Determines if the user has purchased and received this product before reviewing it.
        """
        return OrderItem.objects.filter(
            order__user=obj.user,
            order__status='Delivered',
            product=obj.product
        ).exists()

    def validate(self, attrs):
        user = self.context['request'].user
        product = attrs.get('product')
        
        # Prevent duplicate reviews by the same user on the same product
        if self.instance is None:  # on creation only
            if Review.objects.filter(user=user, product=product).exists():
                raise serializers.ValidationError("You have already reviewed this product.")
                
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
