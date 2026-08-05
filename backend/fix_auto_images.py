import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from django.core.files.base import ContentFile
import urllib.request
import urllib.error

category_images = {
    'Alloy Wheels': 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&q=80&w=600', # Changed to a reliable car wheel image
    'Exhaust Systems': 'https://images.unsplash.com/photo-1600705354929-e8544c4b5722?auto=format&fit=crop&q=80&w=600', # Exhaust-like
    'Suspension': 'https://images.unsplash.com/photo-1611082697843-0268ecf7d0dc?auto=format&fit=crop&q=80&w=600', # Engine bay / parts
    'Racing Seats': 'https://images.unsplash.com/photo-1589139611181-e28d48a27d14?auto=format&fit=crop&q=80&w=600', # Car interior
    'Steering Wheels': 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=600', # Steering wheel
    'Body Kits': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600', # Sports car exterior
    'Brake Kits': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600', # Rim with brakes
}

downloaded_files = {}

for cat_name, url in category_images.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        downloaded_files[cat_name] = response.read()
        print(f"Downloaded image for {cat_name}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error for {cat_name}: {e.code}")
    except Exception as e:
        print(f"Error for {cat_name}: {e}")

products = Product.objects.all()
for product in products:
    if not product.thumbnail and product.category and product.category.name in downloaded_files:
        cat_name = product.category.name
        content = downloaded_files[cat_name]
        file_name = f"{product.slug}.jpg"
        product.thumbnail.save(file_name, ContentFile(content), save=True)
        print(f"Saved image for: {product.name}")

print("Image fix complete!")
