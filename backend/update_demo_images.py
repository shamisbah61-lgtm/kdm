import os
import django
import requests
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product

products = Product.objects.all()

for p in products:
    text = p.name.replace(' ', '+')
    url = f"https://placehold.co/400x400/111111/ff3333/png?text={text}"
    print(f"Downloading {url}")
    
    try:
        resp = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp.raise_for_status()
        p.thumbnail.save(f"thumb_{p.id}.png", ContentFile(resp.content))
        print(f"Updated {p.name}")
    except Exception as e:
        print(f"Failed for {p.name}: {e}")
