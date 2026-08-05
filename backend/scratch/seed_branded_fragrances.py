import os
import sys
import django

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.categories.models import Category
from apps.products.models import Product

print("Deleting existing products and categories...")
Product.objects.all().delete()
Category.objects.all().delete()

me_cat, _ = Category.objects.get_or_create(
    name="Middle East",
    defaults={
        "description": "Rich, opulent, and exotic scents highlighting precious agarwood (Oud), saffron, frankincense, and warm spices.",
        "is_active": True
    }
)
eu_cat, _ = Category.objects.get_or_create(
    name="Europe",
    defaults={
        "description": "Sophisticated, classic, and award-winning French, British, and Italian masterpieces from luxury design & niche houses.",
        "is_active": True
    }
)
sa_cat, _ = Category.objects.get_or_create(
    name="South America",
    defaults={
        "description": "Captivating and exotic scents crafted using native Patagonian botany, Brazilian oakwood-aged accords, and tropical resins.",
        "is_active": True
    }
)

print("Created Branded Regional Categories.")

branded_items = [
    {"name": "Creed Aventus Eau de Parfum", "price": 30295.00, "qty": 45, "category": eu_cat, "desc": "The legendary luxury fragrance featuring pineapple, blackcurrant, birchwood, and oakmoss.", "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600"},
    {"name": "Parfums de Marly Layton Exquisite", "price": 24070.00, "qty": 35, "category": eu_cat, "desc": "An elegant oriental-floral fragrance with apple, lavender, vanilla, pepper, and precious wood notes.", "image": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600"},
    {"name": "Jean Paul Gaultier Le Male Elixir", "price": 12865.00, "qty": 80, "category": eu_cat, "desc": "A warm, intensely sensual aromatic blend of honeyed tobacco, lavender, fresh mint, and deep benzoin.", "image": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600"},
    {"name": "Giorgio Armani Acqua di Gio Profondo", "price": 12035.00, "qty": 110, "category": eu_cat, "desc": "A marine-aquatic masterpiece featuring salty sea notes, rosemary, cypress, lavender, and patchouli.", "image": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600"},
    {"name": "YSL Y Eau de Parfum", "price": 11205.00, "qty": 95, "category": eu_cat, "desc": "A sophisticated woody aromatic fragrance featuring green apple, white sage, juniper berries, and tonka bean.", "image": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600"},
    {"name": "Dior Sauvage Elixir", "price": 19090.00, "qty": 70, "category": eu_cat, "desc": "An ultra-concentrated fragrance steeped in the iconic freshness of Sauvage with an intoxicating heart of spices.", "image": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600"},
    {"name": "Chanel Bleu de Chanel Parfum", "price": 14940.00, "qty": 65, "category": eu_cat, "desc": "An intense woody aromatic statement with a deep, warm trail of precious New Caledonian sandalwood.", "image": "https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600"},
    {"name": "Tom Ford Oud Wood", "price": 24485.00, "qty": 40, "category": eu_cat, "desc": "One of the most rare, precious, and expensive ingredients in a perfumer's arsenal, oud wood is truly iconic.", "image": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600"},
    {"name": "Maison Francis Kurkdjian Baccarat Rouge 540", "price": 26975.00, "qty": 30, "category": eu_cat, "desc": "A poetic alchemy where jasmine and saffron carry mineral facets of ambergris and cedar.", "image": "https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&q=80&w=600"},
    {"name": "Byredo Gypsy Water", "price": 16600.00, "qty": 55, "category": eu_cat, "desc": "The scent of fresh soil, deep forests and campfires. A beautiful glamorization of the Romany lifestyle.", "image": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600"},
    
    {"name": "Gissah Imperial Valley Extrait", "price": 16185.00, "qty": 50, "category": me_cat, "desc": "The prestigious Middle Eastern sensation featuring rich agarwood, spicy pink pepper, saffron, and musk.", "image": "https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600"},
    {"name": "Rasasi Hawas for Him", "price": 7885.00, "qty": 150, "category": me_cat, "desc": "A highly acclaimed fresh aquatic fragrance blending apple, bergamot, cinnamon, and sweet ambergris.", "image": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600"},
    {"name": "Rasasi La Yuqawam Pour Homme", "price": 9960.00, "qty": 65, "category": me_cat, "desc": "A masterpiece of luxury leather, raspberry, saffron, thyme, jasmine, frankincense, amber, and suede.", "image": "https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&q=80&w=600"},
    {"name": "Amouage Interlude Man", "price": 28220.00, "qty": 30, "category": me_cat, "desc": "The legendary Blue Beast: a spicy-woody extrait featuring frankincense, myrrh, leather, amber, oud, and sandalwood.", "image": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600"},
    {"name": "Gissah Hudson Valley", "price": 15355.00, "qty": 55, "category": me_cat, "desc": "A luxurious and aromatic Middle Eastern blend featuring blackcurrant, rose, sweet caramel, and clean amber.", "image": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600"},
    {"name": "Lattafa Khamrah Eau de Parfum", "price": 4980.00, "qty": 180, "category": me_cat, "desc": "A luxurious oriental spicy sweet perfume combining precious spices, warm woody notes, and sweet vanilla.", "image": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600"},
    {"name": "Afnan 9PM Pour Homme", "price": 4565.00, "qty": 200, "category": me_cat, "desc": "A fresh gourmand fragrance with green apple, lavender, warm vanilla, rich amber, and spicy patchouli notes.", "image": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600"},
    {"name": "Swiss Arabian Shaghaf Oud", "price": 5810.00, "qty": 140, "category": me_cat, "desc": "An oriental oud fragrance that wraps your heart in golden saffron, rich rose, deep agarwood, and praline.", "image": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600"},
    
    {"name": "Fueguia 1833 Muskara Apis", "price": 31955.00, "qty": 20, "category": sa_cat, "desc": "A high-end niche fragrance from Patagonia, combining wild honey notes, plant-derived musk, and exotic resins.", "image": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"},
    {"name": "O Boticário Malbec Club Intense", "price": 7055.00, "qty": 140, "category": sa_cat, "desc": "A Brazilian premium fragrance aged in French oak barrels, featuring wine notes, cardamon, and warm leather.", "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600"},
    {"name": "Natura Homem Dom", "price": 6225.00, "qty": 125, "category": sa_cat, "desc": "A warm Brazilian fragrance featuring native priprioca root, sweet vanilla, black pepper, and precious woods.", "image": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600"},
    {"name": "Fueguia 1833 Humboldt", "price": 29880.00, "qty": 25, "category": sa_cat, "desc": "A captivating Patagonian citrus-woody fragrance featuring passionfruit, green mandarin, and bergamot wood.", "image": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600"},
    {"name": "O Boticário Zaad Santal", "price": 7470.00, "qty": 115, "category": sa_cat, "desc": "A sophisticated blend featuring warm Australian sandalwood, whiskey, ginger, and rich nutmeg.", "image": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600"},
    {"name": "Natura Essencial Mirra", "price": 6640.00, "qty": 90, "category": sa_cat, "desc": "A magnificent blend of exotic Brazilian Myrrh, warm amber, spicy black pepper, and precious woods.", "image": "https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600"}
]

for item in branded_items:
    prod, created = Product.objects.update_or_create(
        name=item["name"],
        defaults={
            "category": item["category"],
            "price": item["price"],
            "quantity": item["qty"],
            "short_description": item["desc"],
            "full_description": f"{item['desc']} Developed by premium perfume houses with long-lasting sillage. 100% genuine and authentic fragrance formulation.",
            "thumbnail": item["image"],
            "is_active": True
        }
    )
    print(f"Product '{prod.name}' - Created: {created}")

print("Branded regional fragrance seeding completed successfully with INR pricing!")
