from django.contrib import admin
from apps.reviews.models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    search_fields = ('product__name', 'user__email', 'comment')
    list_filter = ('rating', 'created_at')
    ordering = ('-created_at',)
    raw_id_fields = ('product',)
