from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.coupons.views import CouponViewSet

router = DefaultRouter()
router.register(r'', CouponViewSet, basename='coupon')

urlpatterns = [
    path(r'', include(router.urls)),
]
