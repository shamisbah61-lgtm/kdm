import os
import django
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product

mapping = {
    'Volk Racing TE37 Bronze 18" Alloys': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\bronze_alloy_wheel_1784886593722.png',
    'HKS Hi-Power Exhaust System': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\titanium_car_exhaust_1784886602900.png',
    'Nardi Deep Corn Steering Wheel': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\racing_steering_wheel_1784886613801.png',
    'Mugen Carbon Fiber Spoiler': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\carbon_fiber_spoiler_1784886623694.png',
    'Brembo 6-Pot Big Brake Kit': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\big_brake_kit_1784886634095.png',
    'Sparco Sprint Racing Seat': r'C:\Users\misbah\.gemini\antigravity\brain\973542d7-663d-4515-aeec-b1a2f808a028\sparco_racing_seat_1784886645990.png',
}

for name, path in mapping.items():
    try:
        p = Product.objects.get(name=name)
        with open(path, 'rb') as f:
            p.thumbnail.save(os.path.basename(path), ContentFile(f.read()))
        print(f"Successfully updated {name}")
    except Exception as e:
        print(f"Error for {name}: {e}")
