import os
import sys
import django

# Add parent directory to python path for module loading
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.categories.models import Category
from apps.products.models import Product

# Clean existing products and categories to remove liquor references
print("Deleting existing products and categories...")
Product.objects.all().delete()
Category.objects.all().delete()

# Create Categories
mixers_cat, _ = Category.objects.get_or_create(
    name="Gourmet Mixers",
    defaults={"description": "Premium craft mixers, tonic waters, and sodas for elite pairings."}
)
mocktails_cat, _ = Category.objects.get_or_create(
    name="Signature Mocktails",
    defaults={"description": "Artisanal non-alcoholic mocktails, pre-mixed and ready to serve."}
)
syrups_cat, _ = Category.objects.get_or_create(
    name="Botanical Syrups",
    defaults={"description": "Exquisite hand-pressed fruit, herb, and spice syrups."}
)

print("Created Categories.")

# List of 15 premium non-alcoholic products
beverage_items = [
    {
        "name": "Blueberry Lavender Mojito Mocktail",
        "price": 280.00,
        "qty": 150,
        "category": mocktails_cat,
        "desc": "Gourmet craft mocktail with local lavender infusion, muddled mountain blueberries, and fresh lime.",
        "image": "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Spiced Ginger & Lime Craft Mixer",
        "price": 190.00,
        "qty": 120,
        "category": mixers_cat,
        "desc": "Premium ginger beer alternative brewed with wild ginger from Wayanad and fresh lime zest.",
        "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Hibiscus Rose Tonic Water",
        "price": 180.00,
        "qty": 180,
        "category": mixers_cat,
        "desc": "Premium tonic infused with Munnar hibiscus flowers and organic rose petals. Perfect for botanical mocktails.",
        "image": "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Premium Triple Lemon Bitter Soda",
        "price": 160.00,
        "qty": 200,
        "category": mixers_cat,
        "desc": "Refreshing bitter lemon soda crafted with Kanjirappally lemons, featuring a sharp citrus bite.",
        "image": "https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Smoked Orange & Rosemary Syrup",
        "price": 320.00,
        "qty": 90,
        "category": syrups_cat,
        "desc": "Rich, velvety craft syrup made from cold-smoked Nagpur oranges and fresh hand-picked rosemary.",
        "image": "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Sparkling Apple Jalapeno Craft Fizz",
        "price": 240.00,
        "qty": 80,
        "category": mocktails_cat,
        "desc": "Crisp Kashmiri apple juice infused with local green jalapenos for a unique sweet-spicy kick.",
        "image": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Cucumber Mint Cool Breeze Mocktail",
        "price": 210.00,
        "qty": 140,
        "category": mocktails_cat,
        "desc": "Ultra-refreshing, hydrating blend of cucumber extract and field mint leaves.",
        "image": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Crimson Cranberry Basil Infusion",
        "price": 250.00,
        "qty": 110,
        "category": mocktails_cat,
        "desc": "Tart American cranberry juice balanced with fresh aromatic sweet basil leaves.",
        "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Roasted Pineapple Chili Shrub",
        "price": 340.00,
        "qty": 60,
        "category": syrups_cat,
        "desc": "Tangy roasted pineapple vinegar shrub spiked with local bird's eye chili (Kanthari).",
        "image": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Elderflower Grapefruit Tonic Mixer",
        "price": 220.00,
        "qty": 130,
        "category": mixers_cat,
        "desc": "Elegant floral elderflower extract combined with ruby red grapefruit juice for a bittersweet finish.",
        "image": "https://images.unsplash.com/photo-1575444758702-4a6b9222336e?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Wild Berry Sage Botanical Water",
        "price": 180.00,
        "qty": 150,
        "category": mocktails_cat,
        "desc": "Pure spring water infused with a blend of forest berries and fresh garden sage.",
        "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Citrus Cardamom Indian Tonic",
        "price": 170.00,
        "qty": 200,
        "category": mixers_cat,
        "desc": "Classic sparkling tonic water spiced with green cardamom pods from Idukki hills.",
        "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Golden Ginger Beer Extra Fiery",
        "price": 190.00,
        "qty": 120,
        "category": mixers_cat,
        "desc": "High-impact fermented ginger brew with dark molasses and premium carbonation.",
        "image": "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Blood Orange Hibiscus Craft Soda",
        "price": 200.00,
        "qty": 140,
        "category": mixers_cat,
        "desc": "Sweet-tart soda made with Sicilian blood oranges and steeped red hibiscus tea.",
        "image": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Matcha Green Tea Lemonade",
        "price": 260.00,
        "qty": 90,
        "category": mocktails_cat,
        "desc": "Ceremonial grade green tea matcha whisked and blended with fresh lemons and organic honey.",
        "image": "https://images.unsplash.com/photo-1568901839119-631418a381fb?auto=format&fit=crop&q=80&w=600"
    }
]

for item in beverage_items:
    prod, created = Product.objects.update_or_create(
        name=item["name"],
        defaults={
            "category": item["category"],
            "price": item["price"],
            "quantity": item["qty"],
            "short_description": item["desc"],
            "full_description": f"{item['desc']} Made with 100% natural ingredients, no artificial preservatives. Store chilled.",
            "thumbnail": item["image"],
            "is_active": True
        }
    )
    print(f"Product '{prod.name}' - Created: {created}")

print("Seeding completed successfully!")
