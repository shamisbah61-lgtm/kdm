from django.contrib import admin
from apps.payments.models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'payment_method', 'transaction_id', 'amount', 'status', 'created_at')
    search_fields = ('order__order_number', 'transaction_id', 'order__user__email')
    list_filter = ('status', 'payment_method', 'created_at')
    ordering = ('-created_at',)
