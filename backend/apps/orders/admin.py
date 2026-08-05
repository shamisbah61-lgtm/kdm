from django.contrib import admin
from django.urls import path
from django.shortcuts import render, get_object_or_404
from django.utils.html import format_html
from apps.orders.models import Address, Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    raw_id_fields = ('product',)
    readonly_fields = ('subtotal',)

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'phone', 'city', 'state', 'country', 'default')
    search_fields = ('user__email', 'name', 'city')
    list_filter = ('default', 'country')
    ordering = ('user', '-default')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'address', 'status', 'payment_method', 'payment_status', 'final_amount', 'created_at', 'print_invoice_link')
    list_filter = ('status', 'payment_method', 'payment_status', 'created_at')
    search_fields = ('order_number', 'user__email', 'address__name', 'address__phone', 'address__city')
    ordering = ('-created_at',)
    inlines = [OrderItemInline]
    readonly_fields = ('full_shipping_address', 'print_invoice_link')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<path:object_id>/invoice/', self.admin_site.admin_view(self.invoice_view), name='order-invoice'),
        ]
        return custom_urls + urls

    def invoice_view(self, request, object_id):
        order = get_object_or_404(Order, pk=object_id)
        return render(request, 'orders/invoice.html', {'order': order})

    def print_invoice_link(self, obj):
        if obj.pk:
            url = f"/admin/orders/order/{obj.pk}/invoice/"
            return format_html('<a class="button" style="background-color: #417690; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none;" href="{}" target="_blank">Print Invoice</a>', url)
        return "-"
    print_invoice_link.short_description = "Invoice"

    def full_shipping_address(self, obj):
        if obj.address:
            return f"{obj.address.name} | Ph: {obj.address.phone} | {obj.address.address}, {obj.address.city}, {obj.address.state}, {obj.address.country} - {obj.address.zipcode}"
        return "No Address"
    full_shipping_address.short_description = "Full Shipping Address"
    
    # Custom admin actions to update order statuses in bulk
    actions = ['mark_confirmed', 'mark_packed', 'mark_shipped', 'mark_delivered', 'mark_paid']

    def mark_confirmed(self, request, queryset):
        queryset.update(status='Confirmed')
    mark_confirmed.short_description = "Mark selected orders as Confirmed"

    def mark_packed(self, request, queryset):
        queryset.update(status='Packed')
    mark_packed.short_description = "Mark selected orders as Packed"

    def mark_shipped(self, request, queryset):
        queryset.update(status='Shipped')
    mark_shipped.short_description = "Mark selected orders as Shipped"

    def mark_delivered(self, request, queryset):
        queryset.update(status='Delivered')
    mark_delivered.short_description = "Mark selected orders as Delivered"

    def mark_paid(self, request, queryset):
        queryset.update(payment_status='Paid')
    mark_paid.short_description = "Mark payment status as Paid"
