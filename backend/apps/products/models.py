import uuid
from django.db import models
from django.utils.text import slugify
from apps.categories.models import Category
from django.conf import settings

class Product(models.Model):
    """
    Product model representing premium wood craft items.
    """
    STOCK_STATUS_CHOICES = (
        ('in_stock', 'In Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('on_backorder', 'On Backorder'),
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='products',
        null=True,
        blank=True
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    sku = models.CharField(max_length=50, unique=True, blank=True)
    short_description = models.TextField(blank=True, null=True)
    full_description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=0)
    stock_status = models.CharField(
        max_length=20,
        choices=STOCK_STATUS_CHOICES,
        default='in_stock'
    )
    brand = models.CharField(max_length=100, blank=True, null=True)
    condition = models.CharField(
        max_length=50,
        choices=[('new', 'New'), ('refurbished', 'Refurbished'), ('used', 'Used')],
        default='new'
    )
    weight = models.DecimalField(max_digits=10, decimal_places=2, help_text="Weight in kg", blank=True, null=True)
    dimensions = models.CharField(max_length=100, help_text="L x W x H", blank=True, null=True)
    hsn_code = models.CharField(max_length=50, blank=True, null=True)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    featured = models.BooleanField(default=False)
    thumbnail = models.ImageField(upload_to='products/thumbnails/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Auto slugify
        if not self.slug:
            self.slug = slugify(self.name)
        
        # Auto generate SKU
        if not self.sku:
            self.sku = f"MC-{uuid.uuid4().hex[:8].upper()}"

        # Automatic Stock Status based on Quantity
        if self.quantity == 0:
            self.stock_status = 'out_of_stock'
        else:
            if self.stock_status == 'out_of_stock':
                self.stock_status = 'in_stock'

        super().save(*args, **kwargs)

    @property
    def final_price(self):
        """
        Returns discount price if it exists, otherwise standard price.
        """
        if self.discount_price and self.discount_price < self.price:
            return self.discount_price
        return self.price

    @property
    def has_discount(self):
        return self.discount_price is not None and self.discount_price < self.price


class ProductImage(models.Model):
    """
    ProductImage model supporting multiple images per wood craft product.
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='products/gallery/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Gallery image for {self.product.name}"
