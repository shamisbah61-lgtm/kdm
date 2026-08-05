import os
import sys
import django

# Add parent directory to python path for module loading
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.categories.models import Category
from apps.products.models import Product

# Clean existing products and categories to remove drink references
print("Deleting existing products and categories...")
Product.objects.all().delete()
Category.objects.all().delete()

# Create Luxury Fragrance Categories
woody_cat, _ = Category.objects.get_or_create(
    name="Oud & Woody",
    defaults={
        "description": "Rich, deep scents showcasing precious agarwood, warm cedarwood, and creamy sandalwood.",
        "is_active": True
    }
)
floral_cat, _ = Category.objects.get_or_create(
    name="Floral & Botanical",
    defaults={
        "description": "Graceful, blooming bouquets featuring rare jasmine, damask rose, and orange blossom.",
        "is_active": True
    }
)
fresh_cat, _ = Category.objects.get_or_create(
    name="Fresh & Citrus",
    defaults={
        "description": "Bright, uplifting, and oceanic fragrances highlighting bergamot, neroli, and marine accords.",
        "is_active": True
    }
)

print("Created Fragrance Categories.")

# List of 15 premium niche fragrance products
fragrance_items = [
    {
        "name": "Santal Nobile Eau de Parfum",
        "price": 180.00,
        "qty": 120,
        "category": woody_cat,
        "desc": "A creamy Mysore sandalwood core wrapped in warm spices, dry cedar, and velvet amber.",
        "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Rose de Mai Absolu",
        "price": 220.00,
        "qty": 90,
        "category": floral_cat,
        "desc": "A voluptuous, romantic bouquet of Centifolia rose, fresh pink peony, and soft white musk from Grasse.",
        "image": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Neroli Sauvage Parfum",
        "price": 160.00,
        "qty": 150,
        "category": fresh_cat,
        "desc": "Crisp Mediterranean bitter orange blossom, sea breeze accord, and bright Italian bergamot.",
        "image": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Oud Imperial Extrait",
        "price": 290.00,
        "qty": 80,
        "category": woody_cat,
        "desc": "A dark, hypnotic blend of rare Cambodian agarwood (Oud), luxury leather, patchouli, and smoky incense.",
        "image": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Jardin de Jasmin",
        "price": 195.00,
        "qty": 110,
        "category": floral_cat,
        "desc": "Wild jasmine sambac, green tea leaf, and creamy tuberose under fresh morning dew.",
        "image": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Bergamote Infusion",
        "price": 150.00,
        "qty": 140,
        "category": fresh_cat,
        "desc": "Vibrant Calabrian bergamot, green cardamom, Vetiver grass, and bright white amber.",
        "image": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Vetiver Noir Intense",
        "price": 175.00,
        "qty": 130,
        "category": woody_cat,
        "desc": "Smoky Haitian vetiver, crushed black pepper, aromatic cypress, and dark forest cedarwood.",
        "image": "https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Fleur d'Oranger",
        "price": 185.00,
        "qty": 100,
        "category": floral_cat,
        "desc": "Sun-drenched Mediterranean orange blossom, sweet honey, and Madagascar vanilla orchid.",
        "image": "https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Maris Sal Marine Accord",
        "price": 165.00,
        "qty": 160,
        "category": fresh_cat,
        "desc": "Crushed sea salt, coastal wild sage, weathered driftwood, and cold-pressed grapefruit zest.",
        "image": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Tabac & Vanille Impériale",
        "price": 240.00,
        "qty": 90,
        "category": woody_cat,
        "desc": "Rich tobacco leaf, sweet tonka bean, Madagascar vanilla, and spiced dried fruits.",
        "image": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Tuberose Royale",
        "price": 210.00,
        "qty": 70,
        "category": floral_cat,
        "desc": "Opulent tuberose, gardenia, warm amberwood, and a touch of sweet coconut milk.",
        "image": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Mandarine & Cardamome",
        "price": 140.00,
        "qty": 180,
        "category": fresh_cat,
        "desc": "Zesty green mandarin, crushed green cardamom pods, and a base of light clean musk.",
        "image": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Encens Flamboyant",
        "price": 260.00,
        "qty": 60,
        "category": woody_cat,
        "desc": "Mystical Somalian frankincense, warm cloves, labdanum resin, and sweet balsamic fir.",
        "image": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Peony & White Suede",
        "price": 190.00,
        "qty": 115,
        "category": floral_cat,
        "desc": "Delicate pink peonies in full bloom, red apple bite, and soft, luxurious white suede.",
        "image": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600"
    },
    {
        "name": "Aqua Universalis Extrait",
        "price": 170.00,
        "qty": 145,
        "category": fresh_cat,
        "desc": "Crisp white linen, clean musk, Amalfi lemon, and white lily of the valley.",
        "image": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600"
    }
]

for item in fragrance_items:
    prod, created = Product.objects.update_or_create(
        name=item["name"],
        defaults={
            "category": item["category"],
            "price": item["price"],
            "quantity": item["qty"],
            "short_description": item["desc"],
            "full_description": f"{item['desc']} Crafted in small batches by master perfumers. 100% vegan, cruelty-free, and sustainably sourced.",
            "thumbnail": item["image"],
            "is_active": True
        }
    )
    print(f"Product '{prod.name}' - Created: {created}")

print("Fragrance seeding completed successfully!")
