from django.db import models
from django.utils import timezone

class Coupon(models.Model):
    """
    Coupon model representing promotional discounts.
    """
    code = models.CharField(max_length=50, unique=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Flat discount amount")
    minimum_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Minimum order total required")
    expiry = models.DateTimeField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        """
        Check if the coupon is active and has not expired.
        """
        return self.active and self.expiry > timezone.now()

    def is_applicable(self, order_total):
        """
        Checks if order total meets the minimum amount requirement and coupon is valid.
        """
        return self.is_valid and order_total >= self.minimum_amount
