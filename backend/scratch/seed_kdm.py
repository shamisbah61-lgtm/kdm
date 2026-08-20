import os
import sys
import django

# Add parent directory to python path for module loading
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.categories.models import Category
from apps.products.models import Product

# Clear old data (Liquor, etc)
print("Clearing old products and categories...")
Product.objects.all().delete()
Category.objects.all().delete()

# Create Categories
cat_parts, _ = Category.objects.get_or_create(
    name="Auto Parts",
    defaults={"description": "High performance auto parts for KDM vehicles."}
)
cat_acc, _ = Category.objects.get_or_create(
    name="Accessories",
    defaults={"description": "Premium accessories to upgrade your ride."}
)
cat_tools, _ = Category.objects.get_or_create(
    name="Garage Tools",
    defaults={"description": "Professional tools for vehicle maintenance."}
)

print(f"Categories Created.")

# List of KDM auto products
kdm_items = [
    {"name": "Performance Brake Pads", "price": 4500.00, "qty": 50, "cat": cat_parts, "desc": "High-friction brake pads for maximum stopping power."},
    {"name": "Carbon Fiber Rear Spoiler", "price": 12500.00, "qty": 15, "cat": cat_acc, "desc": "Lightweight aerodynamic spoiler for enhanced downforce."},
    {"name": "LED Headlight Conversion Kit", "price": 6800.00, "qty": 30, "cat": cat_acc, "desc": "Ultra-bright 6500K LED bulbs for superior night visibility."},
    {"name": "Synthetic Engine Oil 5W-30 (4L)", "price": 3200.00, "qty": 100, "cat": cat_parts, "desc": "Premium synthetic oil for ultimate engine protection and performance."},
    {"name": "Racing Cold Air Intake", "price": 8500.00, "qty": 20, "cat": cat_parts, "desc": "High-flow intake system for increased horsepower and torque."},
    {"name": "Heavy Duty Floor Jack (3 Ton)", "price": 5400.00, "qty": 10, "cat": cat_tools, "desc": "Professional grade hydraulic jack for safe vehicle lifting."},
    {"name": "Premium All-Weather Car Cover", "price": 2800.00, "qty": 40, "cat": cat_acc, "desc": "Waterproof, UV-resistant car cover for indoor/outdoor protection."},
    {"name": "Performance Spark Plugs (Set of 4)", "price": 1200.00, "qty": 80, "cat": cat_parts, "desc": "Iridium spark plugs for better combustion and fuel efficiency."},
    {"name": "Digital Tire Inflator Compressor", "price": 2100.00, "qty": 60, "cat": cat_tools, "desc": "Portable 12V air compressor with auto-shutoff feature."},
    {"name": "Custom Fit 3D Floor Mats", "price": 3500.00, "qty": 25, "cat": cat_acc, "desc": "Edge-to-edge protection against dirt, spills, and wear."},
]

for item in kdm_items:
    prod, created = Product.objects.update_or_create(
        name=item["name"],
        defaults={
            "category": item["cat"],
            "price": item["price"],
            "quantity": item["qty"],
            "short_description": item["desc"],
            "full_description": f"{item['desc']} Made with high-quality materials to ensure longevity and superior performance for your vehicle.",
            "is_active": True,
            "featured": True
        }
    )
    print(f"Product '{prod.name}' - Created: {created}")

print("KDM Auto Parts DB Seeded Successfully!")
