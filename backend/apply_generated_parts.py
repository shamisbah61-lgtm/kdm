import os
import django
import sys
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from django.core.files.base import File

# Mapping of categories to the generated image paths
generated_images = {
    'Alloy Wheels': r'C:\Users\misbah\.gemini\antigravity\brain\c8343dfc-fd53-4ffe-ba97-fe770c588763\car_part_alloy_wheel_1785229839119.png',
    'Exhaust Systems': r'C:\Users\misbah\.gemini\antigravity\brain\c8343dfc-fd53-4ffe-ba97-fe770c588763\car_part_exhaust_1785229848742.png',
    'Suspension': r'C:\Users\misbah\.gemini\antigravity\brain\c8343dfc-fd53-4ffe-ba97-fe770c588763\car_part_suspension_1785229859658.png',
    'Racing Seats': r'C:\Users\misbah\.gemini\antigravity\brain\c8343dfc-fd53-4ffe-ba97-fe770c588763\car_part_seat_1785229879893.png',
    'Steering Wheels': r'C:\Users\misbah\.gemini\antigravity\brain\c8343dfc-fd53-4ffe-ba97-fe770c588763\car_part_steering_1785229892159.png',
    'Body Kits': r'C:\Users\misbah\.gemini\antigravity\brain\c8343dfc-fd53-4ffe-ba97-fe770c588763\car_part_bodykit_1785229904535.png',
    'Brake Kits': r'C:\Users\misbah\.gemini\antigravity\brain\c8343dfc-fd53-4ffe-ba97-fe770c588763\car_part_brakes_1785229915177.png',
}

products = Product.objects.all()
for product in products:
    if product.category and product.category.name in generated_images:
        img_path = generated_images[product.category.name]
        if os.path.exists(img_path):
            with open(img_path, 'rb') as f:
                file_name = f"{product.slug}.png"
                product.thumbnail.save(file_name, File(f), save=True)
                print(f"Assigned custom part image to: {product.name}")

print("Applied custom generated part images successfully!")
