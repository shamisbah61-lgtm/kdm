from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.orders.views import AddressViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path(r'', include(router.urls)),
]
