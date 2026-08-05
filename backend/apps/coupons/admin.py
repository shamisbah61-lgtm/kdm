from django.contrib import admin
from apps.coupons.models import Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount', 'minimum_amount', 'expiry', 'active', 'is_valid')
    search_fields = ('code',)
    list_filter = ('active', 'expiry', 'created_at')
    ordering = ('-created_at',)
