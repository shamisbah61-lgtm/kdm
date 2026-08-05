import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product, ProductImage
from apps.categories.models import Category
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
import urllib.request

User = get_user_model()
admin_user = User.objects.filter(is_superuser=True).first() or User.objects.first()

# Create or get some categories
cat_decor, _ = Category.objects.get_or_create(name='Home Decor', defaults={'slug': 'home-decor'})
cat_furniture, _ = Category.objects.get_or_create(name='Furniture', defaults={'slug': 'furniture'})
cat_kitchen, _ = Category.objects.get_or_create(name='Kitchenware', defaults={'slug': 'kitchenware'})

products_data = [
    {
        'name': 'Handcrafted Teak Wood Bowl',
        'category': cat_kitchen,
        'price': 1200.00,
        'discount_price': 999.00,
        'quantity': 15,
        'short_description': 'A beautiful handcrafted bowl made from premium teak wood.',
        'description': 'This handcrafted teak wood bowl is perfect for serving salads, fruits, or as a decorative piece. Finished with food-safe natural oils.',
        'image_url': 'https://images.unsplash.com/photo-1596414695392-f044d08436ce?auto=format&fit=crop&q=80&w=800'
    },
    {
        'name': 'Carved Wooden Wall Art',
        'category': cat_decor,
        'price': 3500.00,
        'discount_price': 2999.00,
        'quantity': 5,
        'short_description': 'Intricate mandala wall art carved from solid walnut wood.',
        'description': 'Elevate your living space with this intricately carved wooden mandala. Handcrafted by artisans, this piece brings a touch of rustic elegance to any room.',
        'image_url': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'
    },
    {
        'name': 'Minimalist Oak Coffee Table',
        'category': cat_furniture,
        'price': 12500.00,
        'discount_price': None,
        'quantity': 3,
        'short_description': 'Sleek and minimalist coffee table crafted from solid oak.',
        'description': 'Featuring clean lines and a durable solid oak construction, this coffee table is the perfect centerpiece for a modern living room.',
        'image_url': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800'
    },
    {
        'name': 'Wooden Spice Box with Glass Lid',
        'category': cat_kitchen,
        'price': 850.00,
        'discount_price': 750.00,
        'quantity': 20,
        'short_description': 'Traditional wooden spice box with 9 compartments.',
        'description': 'Keep your spices organized with this traditional wooden masala dabba. Features 9 separate compartments and a transparent glass lid.',
        'image_url': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800'
    },
    {
        'name': 'Rosewood Elephant Figurine',
        'category': cat_decor,
        'price': 1800.00,
        'discount_price': 1500.00,
        'quantity': 10,
        'short_description': 'Hand-carved rosewood elephant figurine with intricate detailing.',
        'description': 'A symbol of wisdom and luck, this beautifully detailed elephant figurine is carved from premium rosewood. Perfect for gifting or home decor.',
        'image_url': 'https://images.unsplash.com/photo-1535287313260-84a11f568b20?auto=format&fit=crop&q=80&w=800'
    },
    {
        'name': 'Mahogany Bookshelf',
        'category': cat_furniture,
        'price': 18000.00,
        'discount_price': 16500.00,
        'quantity': 2,
        'short_description': 'Tall 5-tier bookshelf made from rich mahogany wood.',
        'description': 'Display your favorite books and decor items on this sturdy 5-tier mahogany bookshelf. Features a rich, dark finish that adds warmth to any room.',
        'image_url': 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=800'
    }
]

for pdata in products_data:
    img_url = pdata.pop('image_url')
    desc = pdata.pop('description')
    pdata['full_description'] = desc
    pdata['seller'] = admin_user
    
    if not Product.objects.filter(name=pdata['name']).exists():
        product = Product.objects.create(**pdata)
        
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req)
            image_content = response.read()
            file_name = f"{product.slug}.jpg"
            product.thumbnail.save(file_name, ContentFile(image_content), save=True)
            print(f"Added product: {product.name}")
        except Exception as e:
            print(f"Failed to add image for {product.name}: {e}")
    else:
        print(f"Product {pdata['name']} already exists.")

print("Product addition complete.")
