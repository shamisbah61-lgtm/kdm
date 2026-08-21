import os
import django
import sys
import uuid

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from apps.categories.models import Category
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
import urllib.request
import json

# Delete all existing products and categories to start fresh
Product.objects.all().delete()
Category.objects.all().delete()

User = get_user_model()
admin_user = User.objects.filter(is_superuser=True).first() or User.objects.first()

# Define Automotive Categories
cat_wheels, _ = Category.objects.get_or_create(name='Alloy Wheels', defaults={'slug': 'alloy-wheels'})
cat_exhaust, _ = Category.objects.get_or_create(name='Exhaust Systems', defaults={'slug': 'exhaust-systems'})
cat_suspension, _ = Category.objects.get_or_create(name='Suspension', defaults={'slug': 'suspension'})
cat_seats, _ = Category.objects.get_or_create(name='Racing Seats', defaults={'slug': 'racing-seats'})
cat_steering, _ = Category.objects.get_or_create(name='Steering Wheels', defaults={'slug': 'steering-wheels'})
cat_body, _ = Category.objects.get_or_create(name='Body Kits', defaults={'slug': 'body-kits'})
cat_engine, _ = Category.objects.get_or_create(name='Engine Parts', defaults={'slug': 'engine-parts'})
cat_brakes, _ = Category.objects.get_or_create(name='Brake Kits', defaults={'slug': 'brake-kits'})

products_data = []

# 1. 15 Alloy Wheels
alloy_names = [
    ('Enkei RPF1 Silver 17"', 28000.00),
    ('Enkei RPF1 Matte Black 18"', 32000.00),
    ('Volk Racing TE37 Bronze 17"', 45000.00),
    ('Volk Racing TE37SL Graphite 18"', 48000.00),
    ('BBS LM 2-Piece Gold 18"', 55000.00),
    ('BBS RS 3-Piece Classic Silver 17"', 60000.00),
    ('Work Meister S1 3P White 18"', 52000.00),
    ('Work Emotion CR Kiwami Bronze 18"', 35000.00),
    ('SSR GTV02 Matte Black 17"', 29000.00),
    ('SSR Professor SP1 Silver 18"', 54000.00),
    ('Rotiform LAS-R Silver 19"', 38000.00),
    ('Rotiform BLQ Matte Black 18"', 36000.00),
    ('Vossen HF-2 Tinted Gloss Black 20"', 75000.00),
    ('Vossen CV3-R Silver 19"', 68000.00),
    ('Advan Racing GT Premium Black 18"', 58000.00),
]

for name, price in alloy_names:
    products_data.append({
        'name': name,
        'category': cat_wheels,
        'price': price,
        'quantity': 4,
        'short_description': f'Premium {name} forged alloy wheels.',
        'description': f'Enhance your vehicle\'s look and performance with the {name}. Lightweight, durable, and race-proven.',
        'image_url': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600' # Generic wheel image
    })

# 2. Exhaust Systems
exhausts = [
    ('Invidia Gemini Catback Exhaust VQ35', 75000.00),
    ('Borla S-Type Catback System', 82000.00),
    ('Tomei Expreme Ti Titanium Exhaust', 110000.00),
    ('HKS Legamax Premium Exhaust', 65000.00),
    ('MagnaFlow Street Series Axle-Back', 45000.00),
    ('Armytrix Valvetronic Titanium Exhaust', 195000.00),
]
for name, price in exhausts:
    products_data.append({'name': name, 'category': cat_exhaust, 'price': price, 'quantity': 5, 'short_description': f'High-flow {name}.', 'description': 'Unlock power and sound.', 'image_url': 'https://images.unsplash.com/photo-1599818815777-62f7e7f1eab6?auto=format&fit=crop&q=80&w=600'})

# 3. Suspension
suspensions = [
    ('Tein Flex Z Coilovers', 85000.00),
    ('Bilstein B16 PSS10 Kit', 125000.00),
    ('KW Variant 3 (V3) Coilovers', 150000.00),
    ('BC Racing BR Series Coilovers', 75000.00),
    ('Eibach Pro-Kit Lowering Springs', 22000.00),
    ('Airlift Performance 3P Air Ride Kit', 245000.00),
]
for name, price in suspensions:
    products_data.append({'name': name, 'category': cat_suspension, 'price': price, 'quantity': 3, 'short_description': f'Performance {name}.', 'description': 'Ultimate handling and stance.', 'image_url': 'https://images.unsplash.com/photo-1621215418197-0fc5451eb9dc?auto=format&fit=crop&q=80&w=600'})

# 4. Racing Seats
seats = [
    ('Recaro Sportster CS Leather', 95000.00),
    ('Bride ZETA IV FRP Silver', 82000.00),
    ('Sparco QRT-R FIA Carbon Seat', 75000.00),
    ('Braum Elite-R Series Sport Seats (Pair)', 110000.00),
    ('Corbeau A93 Sport Seat', 45000.00),
]
for name, price in seats:
    products_data.append({'name': name, 'category': cat_seats, 'price': price, 'quantity': 4, 'short_description': f'Authentic {name}.', 'description': 'Maximum support for street and track.', 'image_url': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=600'})

# 5. Steering Wheels
steerings = [
    ('Momo Mod 08 Suede Steering Wheel', 24000.00),
    ('Sparco L575 Leather Steering', 26000.00),
    ('Vertex 10-Star 330mm Steering Wheel', 38000.00),
    ('Personal Grinta 350mm Red Stitching', 25000.00),
]
for name, price in steerings:
    products_data.append({'name': name, 'category': cat_steering, 'price': price, 'quantity': 10, 'short_description': f'Genuine {name}.', 'description': 'Precision control and style.', 'image_url': 'https://images.unsplash.com/photo-1549429402-6014e7a8e57f?auto=format&fit=crop&q=80&w=600'})

# 6. Body Kits & Aero
aeros = [
    ('Liberty Walk GT-R R35 Widebody Kit', 850000.00),
    ('Rocket Bunny V2 Kit GT86/BRZ', 450000.00),
    ('Seibon Carbon Fiber Hood OEM Style', 65000.00),
    ('APR Performance Carbon GT Wing 67"', 85000.00),
]
for name, price in aeros:
    products_data.append({'name': name, 'category': cat_body, 'price': price, 'quantity': 2, 'short_description': f'Aggressive {name}.', 'description': 'Transform your car\'s aerodynamics.', 'image_url': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=600'})

# 7. Brake Kits
brakes = [
    ('Brembo GT 6-Piston Big Brake Kit Front', 280000.00),
    ('Wilwood Forged Superlite 4-Piston Kit', 125000.00),
    ('StopTech Trophy Big Brake Kit', 245000.00),
    ('EBC Brakes Yellowstuff Pad Set', 18000.00),
]
for name, price in brakes:
    products_data.append({'name': name, 'category': cat_brakes, 'price': price, 'quantity': 5, 'short_description': f'High performance {name}.', 'description': 'Stopping power when you need it most.', 'image_url': 'https://images.unsplash.com/photo-1628189871168-f996d98e8f85?auto=format&fit=crop&q=80&w=600'})

import random
for pdata in products_data:
    pdata['discount_price'] = float(pdata['price']) * 0.9 if random.random() > 0.5 else None
    
    img_url = pdata.pop('image_url')
    pdata['full_description'] = pdata.pop('description')
    pdata['seller'] = admin_user
    
    if not Product.objects.filter(name=pdata['name']).exists():
        product = Product.objects.create(**pdata)
        print(f"Added product: {product.name} ({product.category.name})")
    else:
        print(f"Skipped existing: {pdata['name']}")

print("Automotive product addition complete.")
