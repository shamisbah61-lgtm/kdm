import os
import sys
import django

# Add parent directory to python path for module loading
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.categories.models import Category
from apps.products.models import Product

# Define the products we want to keep
desired_beverages = [
    "Matcha Botanical Liqueur",
    "Blood Orange Hibiscus Spiced Rum",
    "Golden Ginger Fiery Whiskey Liqueur",
    "Citrus Cardamom Dry Gin"
]

print("Deleting other products...")
all_products = Product.objects.all()
for prod in all_products:
    if prod.name not in desired_beverages:
        print(f"Deleting: {prod.name}")
        prod.delete()

print("\nCleaning up categories...")
# Ensure categories exist
mixers_cat, _ = Category.objects.get_or_create(
    name="Gourmet Mixers",
    defaults={"description": "Premium craft mixers, tonic waters, and sodas for elite pairings."}
)
mocktails_cat, _ = Category.objects.get_or_create(
    name="Signature Mocktails",
    defaults={"description": "Artisanal non-alcoholic mocktails, pre-mixed and ready to serve."}
)
spirits_cat, _ = Category.objects.get_or_create(
    name="Premium Spirits",
    defaults={"description": "Exquisite selection of premium local and international liquors."}
)

# Delete other categories (like Botanical Syrups) if they have no products left
for cat in Category.objects.all():
    if cat.name not in ["Gourmet Mixers", "Signature Mocktails", "Premium Spirits"]:
        print(f"Deleting category: {cat.name}")
        cat.delete()

# Add Jawan and Old Monk
new_liquors = [
    {
        "name": "Jawan Deluxe XXX Rum",
        "price": 420.00,
        "qty": 150,
        "category": spirits_cat,
        "desc": "Popular state-owned rich blended dark rum from Travancore Sugars & Chemicals Ltd, Thiruvalla.",
        "image": "products/thumbnails/jawan_rum.png"
    },
    {
        "name": "Old Monk Supreme Rum",
        "price": 680.00,
        "qty": 120,
        "category": spirits_cat,
        "desc": "Classic vatted Indian dark rum with a distinct vanilla and caramel flavor profile.",
        "image": "products/thumbnails/old_monk_rum.png"
    }
]

print("\nSeeding Jawan and Old Monk...")
for item in new_liquors:
    prod, created = Product.objects.update_or_create(
        name=item["name"],
        defaults={
            "category": item["category"],
            "price": item["price"],
            "quantity": item["qty"],
            "short_description": item["desc"],
            "full_description": f"{item['desc']} Best enjoyed responsibly. A premium choice available across leading outlets.",
            "thumbnail": item["image"],
            "is_active": True
        }
    )
    print(f"Product '{prod.name}' - Created: {created}, Image: {prod.thumbnail}")

print("\nDatabase adjustment complete!")
