from django.contrib import admin
from django.utils.html import format_html
from apps.categories.models import Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('image_preview_list', 'name', 'slug', 'is_active')
    list_display_links = ('name',)
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)
    
    readonly_fields = ('image_preview_detail',)

    def image_preview_list(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 35px; border-radius: 4px; object-fit: cover;" />', obj.image.url)
        return format_html('<span style="color: #999;">No Image</span>')
    image_preview_list.short_description = 'Image'

    def image_preview_detail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 150px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />', obj.image.url)
        return "No image uploaded."
    image_preview_detail.short_description = 'Image Preview'
