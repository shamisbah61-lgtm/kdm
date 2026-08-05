import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from django.core.files.base import ContentFile
import urllib.request

products_to_fix = {
    'Handcrafted Teak Wood Bowl': 'https://images.unsplash.com/photo-1574316071802-0d684efa7cb5?auto=format&fit=crop&q=80&w=800', # Bowl
    'Rosewood Elephant Figurine': 'https://images.unsplash.com/photo-1582236940854-325b16fb8e49?auto=format&fit=crop&q=80&w=800'  # Elephant
}

for name, img_url in products_to_fix.items():
    product = Product.objects.filter(name=name).first()
    if product and not product.thumbnail:
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req)
            image_content = response.read()
            file_name = f"{product.slug}.jpg"
            product.thumbnail.save(file_name, ContentFile(image_content), save=True)
            print(f"Added fixed image for: {product.name}")
        except Exception as e:
            print(f"Failed to add image for {product.name}: {e}")
