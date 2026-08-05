import os
import django
import sys
import urllib.request
import urllib.error

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from django.core.files.base import ContentFile

missing_urls = {
    'Exhaust Systems': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=600', # Cars general
    'Suspension': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600', # Porsche detail
    'Racing Seats': 'https://images.unsplash.com/photo-1486496146582-9ffcd90d402b?auto=format&fit=crop&q=80&w=600', # Interior
}

downloaded_files = {}

for cat_name, url in missing_urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        downloaded_files[cat_name] = response.read()
        print(f"Downloaded image for {cat_name}")
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

print("Missing image fix complete!")
