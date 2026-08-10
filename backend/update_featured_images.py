import os
import django
from django.core.files.base import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product

image_map = {
    'Garrett GTX3071R Gen II Turbo': r'C:\Users\misbah\.gemini\antigravity\brain\4b021c2f-ac01-40ae-8362-bdfd65892c16\garrett_turbo_1785925380529.png',
    'Recaro Pole Position Seat': r'C:\Users\misbah\.gemini\antigravity\brain\4b021c2f-ac01-40ae-8362-bdfd65892c16\recaro_seat_1785925391940.png',
    'KW V3 Coilover Kit': r'C:\Users\misbah\.gemini\antigravity\brain\4b021c2f-ac01-40ae-8362-bdfd65892c16\kw_v3_1785925401871.png',
    'Akrapovic Titanium Exhaust': r'C:\Users\misbah\.gemini\antigravity\brain\4b021c2f-ac01-40ae-8362-bdfd65892c16\akrapovic_1785925420606.png',
    'BBS RS 3-Piece Wheels 17"': r'C:\Users\misbah\.gemini\antigravity\brain\4b021c2f-ac01-40ae-8362-bdfd65892c16\bbs_rs_1785925444210.png',
    'Momo Prototipo Steering Wheel': r'C:\Users\misbah\.gemini\antigravity\brain\4b021c2f-ac01-40ae-8362-bdfd65892c16\momo_steering_1785925468938.png',
    'Brembo 6-Pot Big Brake Kit': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\big_brake_kit_1784886634095.png',
    'Mugen Carbon Fiber Spoiler': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\carbon_fiber_spoiler_1784886623694.png'
}

for name, img_path in image_map.items():
    try:
        p = Product.objects.get(name=name)
        if os.path.exists(img_path):
            with open(img_path, 'rb') as f:
                p.thumbnail.save(f"{p.slug}.png", File(f), save=True)
                print(f"Updated: {name}")
        else:
            print(f"File not found: {img_path}")
    except Product.DoesNotExist:
        print(f"Product not found: {name}")
    except Exception as e:
        print(f"Error on {name}: {e}")

print("Featured images update complete.")
