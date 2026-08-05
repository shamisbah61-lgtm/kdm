from rest_framework import serializers
from apps.products.models import Product, ProductImage
from apps.categories.serializers import CategorySerializer

class ProductImageSerializer(serializers.ModelSerializer):
    """
    Serializer for multiple gallery images.
    """
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'created_at')


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the Product model, nesting gallery images and showing category details.
    """
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    has_discount = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'seller', 'name', 'slug', 'sku', 'short_description', 'full_description',
            'price', 'discount_price', 'final_price', 'has_discount', 'quantity', 'stock_status',
            'featured', 'thumbnail', 'is_active', 'images', 'uploaded_images', 'created_at', 'updated_at',
            'brand', 'condition', 'weight', 'dimensions', 'hsn_code', 'tax_percentage'
        )
        read_only_fields = ('id', 'slug', 'sku', 'stock_status', 'created_at', 'updated_at', 'seller')

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Set the seller to the current user if available
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['seller'] = request.user
            
        product = Product.objects.create(**validated_data)
        for image in uploaded_images:
            ProductImage.objects.create(product=product, image=image)
        return product

    def update(self, request_instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        product = super().update(request_instance, validated_data)
        if uploaded_images:
            # If new images are uploaded, append them to the gallery
            for image in uploaded_images:
                ProductImage.objects.create(product=product, image=image)
        return product

    def to_representation(self, instance):
        # We want to display the full Category details on read actions
        representation = super().to_representation(instance)
        if instance.category:
            representation['category'] = CategorySerializer(instance.category, context=self.context).data
            representation['category_name'] = instance.category.name
            
        # Ensure thumbnail is an absolute URL
        thumbnail_val = representation.get('thumbnail')
        if thumbnail_val:
            if thumbnail_val.startswith('/media/'):
                request = self.context.get('request')
                if request:
                    representation['thumbnail'] = request.build_absolute_uri(thumbnail_val)
                else:
                    representation['thumbnail'] = 'http://127.0.0.1:8000' + thumbnail_val
            elif '/media/http' in thumbnail_val:
                import urllib.parse
                decoded = urllib.parse.unquote(thumbnail_val)
                media_idx = decoded.find('/media/http')
                if media_idx != -1:
                    external_url = decoded[media_idx + 7:]
                    if 'https:/' in external_url and 'https://' not in external_url:
                        external_url = external_url.replace('https:/', 'https://', 1)
                    elif 'http:/' in external_url and 'http://' not in external_url:
                        external_url = external_url.replace('http:/', 'http://', 1)
                    representation['thumbnail'] = external_url
                    
        return representation
