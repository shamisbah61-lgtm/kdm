from rest_framework import serializers
from django.utils import timezone
from apps.coupons.models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    """
    Serializer for the Coupon model.
    """
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = ('id', 'code', 'discount', 'minimum_amount', 'expiry', 'active', 'is_valid')


class ApplyCouponSerializer(serializers.Serializer):
    """
    Serializer to validate applying a coupon code.
    """
    code = serializers.CharField(required=True)
    order_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)

    def validate(self, attrs):
        code = attrs['code']
        order_total = attrs['order_total']

        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"code": "Coupon code does not exist."})

        if not coupon.is_valid:
            raise serializers.ValidationError({"code": "This coupon has expired or is inactive."})

        if not coupon.is_applicable(order_total):
            raise serializers.ValidationError(
                {"code": f"Order total must be at least {coupon.minimum_amount} to apply this coupon."}
            )

        attrs['coupon'] = coupon
        return attrs
