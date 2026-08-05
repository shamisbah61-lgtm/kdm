import os
import django
from django.core.files.base import ContentFile
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product, Category
from django.contrib.auth import get_user_model

User = get_user_model()
admin_user = User.objects.filter(is_superuser=True).first()

# Create Categories if missing
cat_interior, _ = Category.objects.get_or_create(name='Interior & Seats', defaults={'slug': 'interior-seats'})
cat_wheels, _ = Category.objects.get_or_create(name='Alloy Wheels', defaults={'slug': 'alloy-wheels'})
cat_exhaust, _ = Category.objects.get_or_create(name='Exhaust Systems', defaults={'slug': 'exhaust-systems'})
cat_perf, _ = Category.objects.get_or_create(name='Performance Parts', defaults={'slug': 'performance-parts'})

new_products = [
    {
        'name': 'Momo Prototipo Steering Wheel',
        'slug': 'momo-prototipo-steering-wheel',
        'sku': 'MOMO-PT-001',
        'category': cat_interior,
        'price': 21000,
        'discount_price': 18500,
        'image_path': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\momo_steering_wheel_1784886912222.png',
        'desc': 'Classic Momo Prototipo black leather steering wheel with silver spokes. A timeless addition to any modified car interior.'
    },
    {
        'name': 'BBS RS 3-Piece Wheels 17"',
        'slug': 'bbs-rs-3-piece-wheels-17',
        'sku': 'BBS-RS-17-001',
        'category': cat_wheels,
        'price': 125000,
        'discount_price': None,
        'image_path': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\bbs_rs_wheels_1784886922594.png',
        'desc': 'Legendary BBS RS 3-Piece classic mesh alloy wheels. Silver face with a highly polished lip for that ultimate stance.'
    },
    {
        'name': 'Akrapovic Titanium Exhaust',
        'slug': 'akrapovic-titanium-exhaust',
        'sku': 'AKRA-TIT-001',
        'category': cat_exhaust,
        'price': 85000,
        'discount_price': 79999,
        'image_path': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\akrapovic_exhaust_1784886932706.png',
        'desc': 'Premium Akrapovic slip-on line titanium exhaust system with genuine carbon fiber tips. Unleash the beast.'
    },
    {
        'name': 'KW V3 Coilover Kit',
        'slug': 'kw-v3-coilover-kit',
        'sku': 'KW-V3-001',
        'category': cat_perf,
        'price': 145000,
        'discount_price': 138000,
        'image_path': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\kw_coilovers_1784886942435.png',
        'desc': 'State-of-the-art KW Variant 3 coilover suspension kit. Independent rebound and compression damping adjustment.'
    },
    {
        'name': 'Recaro Pole Position Seat',
        'slug': 'recaro-pole-position-seat',
        'sku': 'RECARO-PP-001',
        'category': cat_interior,
        'price': 78000,
        'discount_price': None,
        'image_path': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\recaro_bucket_seat_1784886952194.png',
        'desc': 'Authentic Recaro Pole Position black velour racing bucket seat. Maximum support and safety on the track.'
    },
    {
        'name': 'Garrett GTX3071R Gen II Turbo',
        'slug': 'garrett-gtx3071r-gen-ii-turbo',
        'sku': 'GARRETT-GTX-001',
        'category': cat_perf,
        'price': 155000,
        'discount_price': 149000,
        'image_path': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\garrett_turbocharger_1784886966077.png',
        'desc': 'High-performance Garrett GTX Gen II ball bearing turbocharger. Massive power gains for serious builds.'
    }
]

for item in new_products:
    try:
        # Create product
        p, created = Product.objects.update_or_create(
            slug=item['slug'],
            defaults={
                'name': item['name'],
                'sku': item['sku'],
                'category': item['category'],
                'seller': admin_user,
                'short_description': item['desc'],
                'full_description': item['desc'] + ' High quality guaranteed.',
                'price': item['price'],
                'discount_price': item['discount_price'],
                'quantity': random.randint(3, 15),
                'stock_status': 'In Stock',
                'featured': True,
                'is_active': True,
            }
        )
        
        # Attach image
        with open(item['image_path'], 'rb') as f:
            p.thumbnail.save(os.path.basename(item['image_path']), ContentFile(f.read()))
        
        print(f"Added {p.name}")
    except Exception as e:
        print(f"Failed to add {item['name']}: {e}")
