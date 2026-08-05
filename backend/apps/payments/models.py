from django.db import models
from apps.orders.models import Order

class Payment(models.Model):
    """
    Payment model representing customer payments for orders.
    """
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    )

    METHOD_CHOICES = (
        ('cod', 'Cash on Delivery'),
        ('stripe', 'Stripe'),
        ('razorpay', 'Razorpay'),
    )

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment_record')
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True, null=True, help_text="Gateway transaction reference ID")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} for Order {self.order.order_number} ({self.status})"
