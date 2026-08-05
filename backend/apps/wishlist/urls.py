from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.wishlist.views import WishlistViewSet

router = DefaultRouter()
router.register(r'', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path(r'', include(router.urls)),
]
