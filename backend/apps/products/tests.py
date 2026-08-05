from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.categories.models import Category
from apps.products.models import Product

class ProductAPITests(APITestCase):
    """
    Test suite for category and product endpoints.
    """
    def setUp(self):
        self.category = Category.objects.create(
            name="Oakwood Crafts",
            description="Oak premium items"
        )
        self.product = Product.objects.create(
            category=self.category,
            name="Oak Coffee Table",
            price=299.99,
            quantity=5
        )
        self.product_list_url = reverse('product-list')
        self.category_list_url = reverse('category-list')

    def test_list_products(self):
        response = self.client.get(self.product_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results are paginated
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']['results']), 1)

    def test_filter_products_by_category(self):
        response = self.client.get(self.product_list_url, {"category_slug": self.category.slug})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']['results']), 1)

        response = self.client.get(self.product_list_url, {"category_slug": "non-existent"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']['results']), 0)
