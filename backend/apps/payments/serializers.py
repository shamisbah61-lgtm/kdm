from rest_framework import serializers
from apps.payments.models import Payment
from apps.orders.models import Order

class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Payment model.
    """
    class Meta:
        model = Payment
        fields = ('id', 'order', 'payment_method', 'transaction_id', 'amount', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class ConfirmPaymentSerializer(serializers.Serializer):
    """
    Serializer to process and confirm a payment (simulated gateway response).
    """
    order_id = serializers.IntegerField(required=True)
    transaction_id = serializers.CharField(required=False, allow_blank=True, default="MOCK-TXN")
    payment_status = serializers.ChoiceField(choices=[('Completed', 'Completed'), ('Failed', 'Failed')], default='Completed')

    def validate_order_id(self, value):
        user = self.context['request'].user
        try:
            order = Order.objects.get(id=value, user=user)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found or does not belong to you.")
        return order

class CreateRazorpayOrderSerializer(serializers.Serializer):
    """
    Serializer to request a new Razorpay Order ID.
    """
    order_id = serializers.IntegerField(required=True)

    def validate_order_id(self, value):
        user = self.context['request'].user
        try:
            order = Order.objects.get(id=value, user=user)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found or does not belong to you.")
        return order

class VerifyRazorpayPaymentSerializer(serializers.Serializer):
    """
    Serializer to verify Razorpay payment signatures.
    """
    order_id = serializers.IntegerField(required=True)
    razorpay_order_id = serializers.CharField(required=True)
    razorpay_payment_id = serializers.CharField(required=True)
    razorpay_signature = serializers.CharField(required=True)

    def validate_order_id(self, value):
        user = self.context['request'].user
        try:
            order = Order.objects.get(id=value, user=user)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found or does not belong to you.")
        return order
