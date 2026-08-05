import os
import django
import urllib.request
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from apps.categories.models import Category
from django.contrib.auth import get_user_model

User = get_user_model()
admin = User.objects.filter(is_superuser=True).first()

# Clear existing
Product.objects.all().delete()
Category.objects.all().delete()

cat_alloys = Category.objects.create(name='Alloy Wheels', slug='alloy-wheels', description='Premium lightweight alloy wheels for better performance and stance.')
cat_exhaust = Category.objects.create(name='Exhaust Systems', slug='exhaust-systems', description='High performance free flow exhaust systems.')
cat_jdm = Category.objects.create(name='JDM Parts', slug='jdm-parts', description='Authentic Japanese Domestic Market accessories and parts.')
cat_interior = Category.objects.create(name='Interior', slug='interior', description='Custom steering wheels, gear knobs, and racing seats.')

products = [
    {
        'name': 'Volk Racing TE37 Bronze 18" Alloys',
        'category': cat_alloys,
        'short_description': 'Legendary forged 1-piece wheel.',
        'full_description': 'The Volk Racing TE37 is a masterpiece of wheel design and engineering. Extremely lightweight and strong.',
        'price': 220000,
        'discount_price': 195000,
        'stock_status': 'in_stock',
        'quantity': 10,
        'featured': True,
        'brand': 'Volk Racing',
        'thumbnail_url': 'https://images.unsplash.com/photo-1590502127264-b0a1d48c9035?auto=format&fit=crop&q=80&w=400'
    },
    {
        'name': 'HKS Hi-Power Exhaust System',
        'category': cat_exhaust,
        'short_description': 'Aggressive JDM exhaust note.',
        'full_description': 'Full stainless steel construction with burnt titanium tip. Provides excellent power gains and a deep growl.',
        'price': 45000,
        'discount_price': 42000,
        'stock_status': 'in_stock',
        'quantity': 5,
        'featured': True,
        'brand': 'HKS',
        'thumbnail_url': 'https://images.unsplash.com/photo-1618698115598-f29e1262d1ef?auto=format&fit=crop&q=80&w=400'
    },
    {
        'name': 'Nardi Deep Corn Steering Wheel',
        'category': cat_interior,
        'short_description': 'Classic JDM steering wheel.',
        'full_description': 'Black leather with red stitching. Adds a classic, sporty feel to any interior.',
        'price': 18500,
        'discount_price': None,
        'stock_status': 'in_stock',
        'quantity': 8,
        'featured': False,
        'brand': 'Nardi',
        'thumbnail_url': 'https://images.unsplash.com/photo-1550993540-10db9f187a03?auto=format&fit=crop&q=80&w=400'
    },
    {
        'name': 'Mugen Carbon Fiber Spoiler',
        'category': cat_jdm,
        'short_description': 'Lightweight aerodynamic spoiler.',
        'full_description': 'Real carbon fiber construction for maximum weight saving and downforce.',
        'price': 28000,
        'discount_price': 25000,
        'stock_status': 'in_stock',
        'quantity': 3,
        'featured': True,
        'brand': 'Mugen',
        'thumbnail_url': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=400'
    },
    {
        'name': 'Brembo 6-Pot Big Brake Kit',
        'category': cat_jdm,
        'short_description': 'High performance stopping power.',
        'full_description': 'Massive 6-piston calipers with slotted rotors for fade-free track performance.',
        'price': 125000,
        'discount_price': 110000,
        'stock_status': 'in_stock',
        'quantity': 2,
        'featured': True,
        'brand': 'Brembo',
        'thumbnail_url': 'https://images.unsplash.com/photo-1502877338535-346ceee819e6?auto=format&fit=crop&q=80&w=400'
    },
    {
        'name': 'Sparco Sprint Racing Seat',
        'category': cat_interior,
        'short_description': 'FIA approved bucket seat.',
        'full_description': 'Lightweight tubular frame racing seat wrapped in fire retardant fabric.',
        'price': 32000,
        'discount_price': None,
        'stock_status': 'in_stock',
        'quantity': 6,
        'featured': False,
        'brand': 'Sparco',
        'thumbnail_url': 'https://images.unsplash.com/photo-1605333189917-062ea98db572?auto=format&fit=crop&q=80&w=400'
    }
]

import requests
from django.core.files.base import ContentFile

for p_data in products:
    url = p_data.pop('thumbnail_url')
    product = Product.objects.create(seller=admin, **p_data)
    
    # Download and save image safely
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        img_content = response.content
        product.thumbnail.save(f"thumb_{product.id}.jpg", ContentFile(img_content))
    except Exception as e:
        print(f"Warning: Failed to download thumbnail for {product.name} - {e}")
        
    print(f"Created {product.name}")

print("Demo data loaded successfully!")
