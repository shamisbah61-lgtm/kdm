from decimal import Decimal
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from apps.orders.models import Address, Order, OrderItem
from apps.cart.models import Cart, CartItem
from apps.coupons.models import Coupon
from apps.products.models import Product
from apps.products.serializers import ProductSerializer

class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for managing shipping addresses.
    """
    class Meta:
        model = Address
        fields = ('id', 'name', 'phone', 'address', 'city', 'state', 'country', 'zipcode', 'default')
        read_only_fields = ('id',)

    def create(self, validated_data):
        # Automatically assign the logged-in user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for order items, listing historical product price and quantity.
    """
    product = ProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'price', 'quantity', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving full order history, including items and address details.
    """
    items = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'address', 'status', 'coupon', 'total_amount',
            'discount_amount', 'final_amount', 'payment_method', 'payment_status',
            'items', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'order_number', 'created_at', 'updated_at')


class CreateOrderSerializer(serializers.Serializer):
    """
    Serializer to place an order from the user's current cart.
    """
    address_id = serializers.IntegerField(required=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES, default='cod')

    def validate_address_id(self, value):
        user = self.context['request'].user
        try:
            address = Address.objects.get(id=value, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError("Address does not exist or does not belong to you.")
        return address

    def validate(self, attrs):
        user = self.context['request'].user
        
        # 1. Fetch Cart
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise serializers.ValidationError("Your cart is empty.")

        cart_items = cart.items.all()
        if not cart_items.exists():
            raise serializers.ValidationError("Your cart is empty.")

        # 2. Check stock limits for each item
        for item in cart_items:
            if item.product.quantity < item.quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for {item.product.name}. Available: {item.product.quantity}, Requested: {item.quantity}"
                )

        attrs['cart'] = cart
        attrs['cart_items'] = cart_items

        # 3. Validate Coupon
        coupon_code = attrs.get('coupon_code')
        order_total = cart.total_price
        coupon = None
        discount_amount = Decimal('0.00')

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
            except Coupon.DoesNotExist:
                raise serializers.ValidationError({"coupon_code": "Invalid coupon code."})

            if not coupon.is_valid:
                raise serializers.ValidationError({"coupon_code": "Coupon has expired or is inactive."})

            if not coupon.is_applicable(order_total):
                raise serializers.ValidationError(
                    {"coupon_code": f"Order total must be at least {coupon.minimum_amount} to apply this coupon."}
                )
            
            # Coupon is valid, calculate discount (do not let discount exceed order total)
            discount_amount = min(coupon.discount, order_total)

        attrs['coupon'] = coupon
        attrs['total_amount'] = order_total
        attrs['discount_amount'] = discount_amount
        attrs['final_amount'] = order_total - discount_amount

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        address = validated_data['address_id']
        coupon = validated_data.get('coupon')
        total_amount = validated_data['total_amount']
        discount_amount = validated_data['discount_amount']
        final_amount = validated_data['final_amount']
        payment_method = validated_data['payment_method']
        cart_items = validated_data['cart_items']

        # 1. Create the Order
        order = Order.objects.create(
            user=user,
            address=address,
            coupon=coupon,
            total_amount=total_amount,
            discount_amount=discount_amount,
            final_amount=final_amount,
            payment_method=payment_method,
            payment_status='Pending'
        )

        # 2. Process CartItems -> OrderItems & update product stock
        for item in cart_items:
            # Re-verify and lock stock using select_for_update for concurrency safety
            product = Product.objects.select_for_update().get(id=item.product.id)
            if product.quantity < item.quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for {product.name} during checkout."
                )

            # Create OrderItem
            OrderItem.objects.create(
                order=order,
                product=product,
                price=product.final_price,
                quantity=item.quantity
            )

            # Decrement inventory stock
            product.quantity -= item.quantity
            product.save()

        # 3. Clear the user's cart
        cart_items.delete()

        return order
