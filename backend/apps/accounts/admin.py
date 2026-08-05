from django.contrib import admin
from django.contrib.auth import get_user_model
from django.utils.html import format_html
from apps.orders.models import Address, Order

User = get_user_model()

class AddressInline(admin.StackedInline):
    model = Address
    extra = 0
    show_change_link = True

class OrderInline(admin.TabularInline):
    model = Order
    extra = 0
    show_change_link = True
    fields = ('order_number', 'status', 'payment_status', 'final_amount', 'created_at')
    readonly_fields = ('order_number', 'status', 'payment_status', 'final_amount', 'created_at')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('image_preview_list', 'email', 'first_name', 'last_name', 'phone', 'is_active', 'is_staff', 'date_joined')
    list_display_links = ('email',)
    list_filter = ('is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    ordering = ('-date_joined',)
    inlines = [AddressInline, OrderInline]
    
    readonly_fields = ('image_preview_detail', 'date_joined', 'last_login')
    
    fieldsets = (
        ('Authentication Information', {
            'fields': ('email', 'password')
        }),
        ('Personal Details', {
            'fields': ('first_name', 'last_name', 'phone', 'profile_image', 'image_preview_detail')
        }),
        ('Permissions & Status', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('date_joined', 'last_login')
        })
    )

    def image_preview_list(self, obj):
        if obj.profile_image:
            return format_html('<img src="{}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />', obj.profile_image.url)
        return format_html('<span style="color: #999;">No Image</span>')
    image_preview_list.short_description = 'Avatar'

    def image_preview_detail(self, obj):
        if obj.profile_image:
            return format_html('<img src="{}" style="max-height: 150px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />', obj.profile_image.url)
        return "No image uploaded yet."
    image_preview_detail.short_description = 'Current Avatar Preview'
