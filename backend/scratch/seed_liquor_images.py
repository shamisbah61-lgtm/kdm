import os
import sys
import django

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product

image_mappings = {
    "Jawan Deluxe XXX Rum": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600",
    "Old Monk Supreme Rum": "https://images.unsplash.com/photo-1614313511387-1436a4480edd?auto=format&fit=crop&q=80&w=600",
    "Magic Moments Premium Vodka": "https://images.unsplash.com/photo-1550976064-ee747e74bb43?auto=format&fit=crop&q=80&w=600",
    "Morpheus Brandy": "https://images.unsplash.com/photo-1510626176961-4b57d4f40a53?auto=format&fit=crop&q=80&w=600",
    "Signature Rare Whisky": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=600",
    "Bacardi Carta Blanca Rum": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=600",
    "Amrut Single Malt Whisky": "https://images.unsplash.com/photo-1569529465841-dfedd87500f6?auto=format&fit=crop&q=80&w=600",
    "Honey Bee Premium Brandy": "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=600",
    "McDowell's No. 1 Celebration Rum": "https://images.unsplash.com/photo-1602872030219-cbf948a907ff?auto=format&fit=crop&q=80&w=600",
    "Smirnoff Triple Distilled Vodka": "https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&q=80&w=600",
    "Mansion House French Brandy": "https://images.unsplash.com/photo-1508253578933-20b529302151?auto=format&fit=crop&q=80&w=600",
    "Teachers Highland Cream Whisky": "https://images.unsplash.com/photo-1470262699888-c67d7a57a0e3?auto=format&fit=crop&q=80&w=600",
    "DSP Black Deluxe Whisky": "https://images.unsplash.com/photo-1582730147233-ac811214815e?auto=format&fit=crop&q=80&w=600",
    "Garrison's Gold Reserve Brandy": "https://images.unsplash.com/photo-1618889482923-382504fd1a28?auto=format&fit=crop&q=80&w=600",
    "Eristoff Premium Vodka": "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?auto=format&fit=crop&q=80&w=600"
}

for name, url in image_mappings.items():
    try:
        p = Product.objects.get(name=name)
        p.thumbnail = url
        p.save()
        print(f"Updated image for '{name}'")
    except Product.DoesNotExist:
        print(f"Product '{name}' not found.")
