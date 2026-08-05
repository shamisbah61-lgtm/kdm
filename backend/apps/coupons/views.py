from rest_framework import permissions, status
from rest_framework.decorators import action
from apps.common.viewsets import BaseModelViewSet
from apps.common.responses import APIResponse
from apps.coupons.models import Coupon
from apps.coupons.serializers import CouponSerializer, ApplyCouponSerializer
from apps.common.permissions import IsAdminOrReadOnly

class CouponViewSet(BaseModelViewSet):
    """
    ViewSet to manage coupons (admin CRUD actions) and validate promotional codes.
    """
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'code'

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='validate')
    def validate_coupon(self, request):
        """
        Validates whether a coupon code is applicable to a specific order total.
        """
        serializer = ApplyCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        coupon = serializer.validated_data['coupon']
        
        return APIResponse(
            success=True,
            message="Coupon code is valid and applicable.",
            data={
                "code": coupon.code,
                "discount": coupon.discount,
                "minimum_amount": coupon.minimum_amount
            }
        )
