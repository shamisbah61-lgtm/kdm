import datetime
import random
from django.db import models
from django.contrib.auth import get_user_model
from apps.products.models import Product
from apps.coupons.models import Coupon

User = get_user_model()

class Address(models.Model):
    """
    Address model representing a customer's shipping address.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    name = models.CharField(max_length=100, help_text="Recipient's Name")
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='United States')
    zipcode = models.CharField(max_length=20)
    default = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Address'
        verbose_name_plural = 'Addresses'
        ordering = ['-default', '-id']

    def __str__(self):
        return f"{self.name} - {self.city}, {self.country}"

    def save(self, *args, **kwargs):
        if self.default:
            # Set all other addresses of this user to default=False
            Address.objects.filter(user=self.user, default=True).exclude(pk=self.pk).update(default=False)
        super().save(*args, **kwargs)


class Order(models.Model):
    """
    Order model representing a customer order.
    """
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Packed', 'Packed'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
        ('Returned', 'Returned'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('cod', 'Cash on Delivery'),
        ('stripe', 'Stripe'),
        ('razorpay', 'Razorpay'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total before coupon discount")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total after coupon discount")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Format: MCO-YYYYMMDD-XXXX where XXXX is random digits
            self.order_number = f"MCO-{datetime.datetime.now().strftime('%Y%m%d')}-{random.randint(10000, 99999)}"
        super().save(*args, **kwargs)

    @property
    def gst_amount(self):
        """
        Calculate 18% inclusive GST based on the final amount.
        Formula: GST = (Final Amount * 18) / 118
        """
        if self.final_amount:
            return round((self.final_amount * 18) / 118, 2)
        return 0.00


class OrderItem(models.Model):
    """
    OrderItem model representing a product and quantity in an order.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price of product at purchase time")
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name if self.product else 'Deleted Product'} (Order: {self.order.order_number})"

    @property
    def subtotal(self):
        return self.price * self.quantity
