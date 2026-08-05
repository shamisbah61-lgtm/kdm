import os
import django
import sys
from PIL import Image, ImageEnhance
import random
import glob

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from django.core.files.base import File

base_dir = r"C:\Users\misbah\.gemini\antigravity\brain\c8343dfc-fd53-4ffe-ba97-fe770c588763"
temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_imgs')
if not os.path.exists(temp_dir):
    os.makedirs(temp_dir)

alloy_paths = []
for i in range(1, 7):
    # Find the generated alloy image file
    matches = glob.glob(os.path.join(base_dir, f'alloy_{i}_*.png'))
    if matches:
        alloy_paths.append(matches[0])

cat_base_images = {}
cat_keys = ['exhaust', 'suspension', 'seat', 'steering', 'bodykit', 'brakes']
cat_names = ['Exhaust Systems', 'Suspension', 'Racing Seats', 'Steering Wheels', 'Body Kits', 'Brake Kits']

for key, name in zip(cat_keys, cat_names):
    matches = glob.glob(os.path.join(base_dir, f'car_part_{key}_*.png'))
    if matches:
        cat_base_images[name] = matches[0]

products = Product.objects.all().order_by('id')

alloy_idx = 0
for product in products:
    cat = product.category.name if product.category else None
    
    if cat == 'Alloy Wheels' and alloy_paths:
        img_path = alloy_paths[alloy_idx % len(alloy_paths)]
        alloy_idx += 1
        
        if os.path.exists(img_path):
            img = Image.open(img_path).convert('RGB')
            # Slight brightness tweak for variety
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(random.uniform(0.85, 1.15))
            
            temp_path = os.path.join(temp_dir, f"{product.slug}.jpg")
            img.save(temp_path, format='JPEG', quality=90)
            
            with open(temp_path, 'rb') as f:
                product.thumbnail.save(f"{product.slug}.jpg", File(f), save=True)
            print(f"Assigned alloy variation to {product.name}")
            
    elif cat in cat_base_images:
        img_path = cat_base_images[cat]
        if os.path.exists(img_path):
            img = Image.open(img_path).convert('RGB')
            
            r, g, b = img.split()
            shift_type = random.choice(['normal', 'swap_rg', 'swap_rb', 'swap_gb', 'darker', 'brighter'])
            
            if shift_type == 'swap_rg':
                img = Image.merge('RGB', (g, r, b))
            elif shift_type == 'swap_rb':
                img = Image.merge('RGB', (b, g, r))
            elif shift_type == 'swap_gb':
                img = Image.merge('RGB', (r, b, g))
                
            enhancer = ImageEnhance.Brightness(img)
            if shift_type == 'darker':
                img = enhancer.enhance(0.7)
            elif shift_type == 'brighter':
                img = enhancer.enhance(1.3)
                
            temp_path = os.path.join(temp_dir, f"{product.slug}.jpg")
            img.save(temp_path, format='JPEG', quality=90)
            
            with open(temp_path, 'rb') as f:
                product.thumbnail.save(f"{product.slug}.jpg", File(f), save=True)
            print(f"Assigned custom variation to {product.name}")

print("Done generating variations!")
