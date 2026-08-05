import os
import sys
import django

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from apps.products.serializers import ProductSerializer

# Get the first product
product = Product.objects.first()
if product:
    serializer = ProductSerializer(product)
    print("Serialized product data:")
    import pprint
    pprint.pprint(serializer.data)
else:
    print("No products found in DB.")
