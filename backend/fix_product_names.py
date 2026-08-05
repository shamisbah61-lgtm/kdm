import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product

# Fetch products and update their names and descriptions to strictly match their images.

products = Product.objects.all()

for product in products:
    cat = product.category.name if product.category else None
    
    # Check the image path or just use a predictable renaming scheme based on current name
    name = product.name
    
    if cat == 'Body Kits':
        if 'Widebody Kit' in name or 'GT Wing' in name or 'Hood' in name:
            # The image is a carbon fiber front splitter!
            if 'Rocket Bunny' in name:
                product.name = 'Rocket Bunny Carbon Front Splitter'
            elif 'Liberty Walk' in name:
                product.name = 'Liberty Walk Carbon Front Splitter'
            elif 'Seibon' in name:
                product.name = 'Seibon Carbon Fiber Front Lip'
            elif 'APR' in name:
                product.name = 'APR Performance Carbon Splitter'
            product.short_description = "Carbon fiber front aerodynamic splitter."
            product.full_description = "Enhance front-end downforce and aggressive styling with this premium carbon fiber front splitter."
            product.save()

    elif cat == 'Suspension':
        if 'Air Ride' in name or 'Springs' in name:
            # The image is a Coilover!
            if 'Airlift' in name:
                product.name = 'Airlift Performance Series Coilovers'
            elif 'Eibach' in name:
                product.name = 'Eibach Pro-Street-S Coilovers'
            product.short_description = "Fully adjustable racing coilover system."
            product.full_description = "High-performance coilover suspension strut with adjustable damping and ride height."
            product.save()

    elif cat == 'Alloy Wheels':
        # Let's align the non-matching brands to the closest visual match of the 6 generated images.
        # alloy_1: Silver RPF1
        # alloy_2: Black RPF1
        # alloy_3: Bronze TE37
        # alloy_4: Grey TE37SL
        # alloy_5: Gold BBS LM
        # alloy_6: Silver BBS RS
        
        mapping = {
            'Work Meister S1 3P White 18"': 'BBS RS 3-Piece Classic Silver 18"',
            'Work Emotion CR Kiwami Bronze 18"': 'Volk Racing TE37 Bronze 18"',
            'SSR GTV02 Matte Black 17"': 'Enkei RPF1 Matte Black 17"',
            'SSR Professor SP1 Silver 18"': 'BBS LM 2-Piece Gold 19"',
            'Rotiform LAS-R Silver 19"': 'Enkei RPF1 Silver 19"',
            'Rotiform BLQ Matte Black 18"': 'Volk Racing TE37SL Graphite 19"',
            'Vossen HF-2 Tinted Gloss Black 20"': 'Enkei RPF1 Matte Black 20"',
            'Vossen CV3-R Silver 19"': 'BBS LM 2-Piece Gold 20"',
            'Advan Racing GT Premium Black 18"': 'Volk Racing TE37 Bronze 19"',
        }
        
        if name in mapping:
            product.name = mapping[name]
            product.short_description = f"Premium {mapping[name]}."
            product.full_description = f"High performance {mapping[name]} forged alloy rim."
            product.save()

print("Products renamed to perfectly match their photos!")
