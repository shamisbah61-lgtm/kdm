from django.contrib import admin
from apps.wishlist.models import Wishlist

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    search_fields = ('user__email', 'product__name', 'product__sku')
    list_filter = ('created_at',)
    ordering = ('-created_at',)
    raw_id_fields = ('product',)
