import os
import sys
import django

# Add parent directory to python path for module loading
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.categories.models import Category
from apps.products.models import Product

# Create Category "Premium Spirits"
cat, created = Category.objects.get_or_create(
    name="Premium Spirits",
    defaults={
        "description": "Exquisite selection of premium beverages and local spirits."
    }
)
print(f"Category 'Premium Spirits' - Created: {created}")

# List of 15 products with Kerala context
liquor_items = [
    {"name": "Jawan Deluxe XXX Rum", "price": 420.00, "qty": 150, "desc": "Popular state-owned rich blended dark rum from Travancore Sugars & Chemicals Ltd, Thiruvalla."},
    {"name": "Old Monk Supreme Rum", "price": 680.00, "qty": 120, "desc": "Classic vatted Indian dark rum with a distinct vanilla and caramel flavor profile."},
    {"name": "Magic Moments Premium Vodka", "price": 750.00, "qty": 80, "desc": "Smooth, triple-distilled grain vodka, ideal for mixing or enjoying neat."},
    {"name": "Morpheus Brandy", "price": 980.00, "qty": 90, "desc": "Highly popular premium grape brandy with a rich, complex aroma and smooth finish."},
    {"name": "Signature Rare Whisky", "price": 850.00, "qty": 70, "desc": "Blended premium whisky from selected grains and aged scotch malts."},
    {"name": "Bacardi Carta Blanca Rum", "price": 1100.00, "qty": 50, "desc": "Smooth, white rum with notes of vanilla and almond, aged in white oak barrels."},
    {"name": "Amrut Single Malt Whisky", "price": 3800.00, "qty": 15, "desc": "Award-winning premium Indian single malt whisky distilled and matured in Bangalore."},
    {"name": "Honey Bee Premium Brandy", "price": 540.00, "qty": 100, "desc": "A popular blended brandy choice in Kerala with sweet notes of honey."},
    {"name": "McDowell's No. 1 Celebration Rum", "price": 490.00, "qty": 200, "desc": "Widely consumed spiced dark rum, a staple for social gatherings in Kerala."},
    {"name": "Smirnoff Triple Distilled Vodka", "price": 950.00, "qty": 60, "desc": "Classic clean-tasting vodka, triple distilled and 10 times filtered for purity."},
    {"name": "Mansion House French Brandy", "price": 820.00, "qty": 90, "desc": "Highly sought-after French-style blended brandy with a fruity character."},
    {"name": "Teachers Highland Cream Whisky", "price": 1800.00, "qty": 30, "desc": "Peated Highland blended Scotch whisky with a rich amber hue and smokey flavor."},
    {"name": "DSP Black Deluxe Whisky", "price": 620.00, "qty": 110, "desc": "Smooth Indian blended whisky, popular for its cost-effective premium taste."},
    {"name": "Garrison's Gold Reserve Brandy", "price": 910.00, "qty": 45, "desc": "Selected grape distillates aged in oak, delivering an elegant golden color and spice notes."},
    {"name": "Eristoff Premium Vodka", "price": 880.00, "qty": 55, "desc": "100% pure grain vodka made from a recipe created in Georgia, triple-distilled."}
]

for item in liquor_items:
    prod, created = Product.objects.update_or_create(
        name=item["name"],
        defaults={
            "category": cat,
            "price": item["price"],
            "quantity": item["qty"],
            "short_description": item["desc"],
            "full_description": f"{item['desc']} Best enjoyed responsibly. A premium choice available across leading outlets.",
            "is_active": True
        }
    )
    print(f"Product '{prod.name}' - Created: {created}")
