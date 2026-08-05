from django.contrib import admin
from django.utils.html import format_html
from apps.products.models import Product, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 80px; border-radius: 4px;" />', obj.image.url)
        return "No image uploaded."
    image_preview.short_description = 'Preview'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('thumbnail_preview_list', 'name', 'sku', 'category', 'price', 'discount_price', 'quantity', 'stock_status', 'featured', 'is_active')
    list_display_links = ('name',)
    list_filter = ('category', 'stock_status', 'featured', 'is_active', 'created_at')
    search_fields = ('name', 'sku', 'short_description', 'full_description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('-created_at',)
    
    inlines = [ProductImageInline]
    
    readonly_fields = ('thumbnail_preview_detail', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'name', 'slug', 'sku', 'featured', 'is_active')
        }),
        ('Descriptions', {
            'fields': ('short_description', 'full_description')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'discount_price', 'quantity', 'stock_status')
        }),
        ('Media Asset', {
            'fields': ('thumbnail', 'thumbnail_preview_detail')
        }),
        ('System Dates', {
            'fields': ('created_at', 'updated_at')
        })
    )

    def thumbnail_preview_list(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="width: 45px; height: 45px; border-radius: 4px; object-fit: cover;" />', obj.thumbnail.url)
        return format_html('<span style="color: #999;">No Thumbnail</span>')
    thumbnail_preview_list.short_description = 'Thumbnail'

    def thumbnail_preview_detail(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="max-height: 150px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />', obj.thumbnail.url)
        return "No thumbnail uploaded."
    thumbnail_preview_detail.short_description = 'Thumbnail Preview'
