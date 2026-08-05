from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from django.db import transaction
from apps.common.viewsets import BaseModelViewSet
from apps.common.responses import APIResponse
from apps.orders.models import Address, Order, OrderItem
from apps.orders.serializers import AddressSerializer, OrderSerializer, CreateOrderSerializer
from apps.products.models import Product

class AddressViewSet(BaseModelViewSet):
    """
    ViewSet to manage user shipping addresses.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class OrderViewSet(BaseModelViewSet):
    """
    ViewSet to manage placing, retrieving, and cancelling orders.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        # Admins see all orders; customers see only their own
        if self.request.user.is_staff:
            return Order.objects.all().prefetch_related('items__product', 'address')
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product', 'address')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse(
            success=True,
            message="Orders retrieved successfully.",
            data=serializer.data
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse(
            success=True,
            message="Order details retrieved successfully.",
            data=serializer.data
        )

    def create(self, request, *args, **kwargs):
        """
        Creates (places) an order from the user's shopping cart.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Format the response with the full details of the created order
        order_details = OrderSerializer(order, context={'request': request}).data
        return APIResponse(
            success=True,
            message="Order placed successfully.",
            data=order_details,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='cancel')
    @transaction.atomic
    def cancel_order(self, request, pk=None):
        """
        Cancels a pending order and restores the product inventory stock.
        """
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return APIResponse(
                success=False,
                message="Order not found.",
                status=status.HTTP_404_NOT_FOUND
            )

        if order.status != 'Pending':
            return APIResponse(
                success=False,
                message=f"Order cannot be cancelled because its current status is '{order.status}'.",
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update order status
        order.status = 'Cancelled'
        order.save()

        # Restore inventory stock for each order item
        for item in order.items.all():
            if item.product:
                product = Product.objects.select_for_update().get(id=item.product.id)
                product.quantity += item.quantity
                product.save()

        order_details = OrderSerializer(order, context={'request': request}).data
        return APIResponse(
            success=True,
            message="Order cancelled successfully. Stock has been restored.",
            data=order_details
        )

    @action(detail=True, methods=['get'], url_path='invoice-html')
    def invoice_html(self, request, pk=None):
        """
        Returns the HTML for the invoice so the frontend can print it securely via API token.
        Requires staff privileges.
        """
        if not request.user.is_staff:
             return APIResponse(success=False, message="Permission denied", status=status.HTTP_403_FORBIDDEN)
             
        try:
            from django.template.loader import render_to_string
            order = Order.objects.get(pk=pk)
            html = render_to_string('orders/invoice.html', {'order': order})
            return APIResponse(
                success=True,
                message="Invoice HTML generated successfully",
                data={"html": html}
            )
        except Order.DoesNotExist:
            return APIResponse(success=False, message="Order not found", status=status.HTTP_404_NOT_FOUND)
