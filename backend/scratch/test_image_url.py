import os
import sys
import django

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product

# Get first product and assign an absolute URL to thumbnail
p = Product.objects.first()
original_val = p.thumbnail
p.thumbnail = 'https://images.unsplash.com/photo-1569529465841-dfedd87500f6?auto=format&fit=crop&q=80&w=400'
p.save()

print("Saved absolute URL to thumbnail.")
print("Database value:", p.thumbnail)
print("URL property:", p.thumbnail.url if p.thumbnail else "None")

# Revert to original just in case
p.thumbnail = original_val
p.save()
