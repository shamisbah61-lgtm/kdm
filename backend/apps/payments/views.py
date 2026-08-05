import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from django.db import transaction
from django.conf import settings
import razorpay
from apps.common.responses import APIResponse
from apps.payments.models import Payment
from apps.payments.serializers import (
    PaymentSerializer, 
    ConfirmPaymentSerializer,
    CreateRazorpayOrderSerializer,
    VerifyRazorpayPaymentSerializer
)
from apps.orders.models import Order

class PaymentViewSet(viewsets.ViewSet):
    """
    ViewSet to process payments (simulating Stripe/Razorpay) and update order details.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='confirm')
    @transaction.atomic
    def confirm_payment(self, request):
        """
        Confirms a mock payment transaction and updates corresponding order records.
        """
        serializer = ConfirmPaymentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        order = serializer.validated_data['order_id']
        payment_status = serializer.validated_data['payment_status']
        transaction_id = serializer.validated_data.get('transaction_id')
        
        if not transaction_id or transaction_id == "MOCK-TXN":
            # Generate a realistic mock transaction ID
            transaction_id = f"txn_{uuid.uuid4().hex[:12]}"

        # Create or update Payment record
        payment, created = Payment.objects.update_or_create(
            order=order,
            defaults={
                'payment_method': order.payment_method,
                'transaction_id': transaction_id,
                'amount': order.final_amount,
                'status': payment_status
            }
        )

        # Update order status based on payment success
        if payment_status == 'Completed':
            order.payment_status = 'Paid'
            order.status = 'Confirmed'
        else:
            order.payment_status = 'Failed'
        order.save()

        payment_details = PaymentSerializer(payment).data
        return APIResponse(
            success=True,
            message="Payment processed successfully." if payment_status == 'Completed' else "Payment transaction failed.",
            data=payment_details
        )

    @action(detail=True, methods=['get'], url_path='status')
    def get_payment_status(self, request, pk=None):
        """
        Retrieves the payment status details for a specific order.
        """
        try:
            order = Order.objects.get(pk=pk)
            # Ensure the user owns this order, or is an administrator
            if order.user != request.user and not request.user.is_staff:
                return APIResponse(
                    success=False,
                    message="Permission denied.",
                    status=status.HTTP_403_FORBIDDEN
                )
            payment = Payment.objects.get(order=order)
        except Order.DoesNotExist:
            return APIResponse(
                success=False,
                message="Order not found.",
                status=status.HTTP_404_NOT_FOUND
            )
        except Payment.DoesNotExist:
            return APIResponse(
                success=True,
                message="No payment record found for this order.",
                data={"status": "Pending", "payment_method": order.payment_method}
            )

        serializer = PaymentSerializer(payment)
        return APIResponse(
            success=True,
            message="Payment status retrieved successfully.",
            data=serializer.data
        )

    @action(detail=False, methods=['post'], url_path='create-razorpay-order')
    def create_razorpay_order(self, request):
        """
        Creates a Razorpay order and returns the Razorpay order ID to the frontend.
        """
        serializer = CreateRazorpayOrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.validated_data['order_id']

        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            return APIResponse(success=False, message="Razorpay credentials not configured.", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        # Amount in paise (multiply by 100)
        amount = int(order.final_amount * 100)
        
        # Razorpay Test Mode has a 5,00,000 INR limit
        if settings.DEBUG and amount > 50000000:
            amount = 50000000
            
        data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"rcptid_{order.id}",
            "notes": {
                "order_number": order.order_number
            }
        }
        
        try:
            razorpay_order = client.order.create(data=data)
            return APIResponse(
                success=True, 
                message="Razorpay order created successfully.", 
                data={
                    "razorpay_order_id": razorpay_order['id'], 
                    "amount": amount, 
                    "currency": "INR"
                }
            )
        except Exception as e:
            return APIResponse(success=False, message=str(e), status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='verify-razorpay-payment')
    @transaction.atomic
    def verify_razorpay_payment(self, request):
        """
        Verifies the Razorpay payment signature and updates the order status.
        """
        serializer = VerifyRazorpayPaymentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        order = serializer.validated_data['order_id']
        razorpay_order_id = serializer.validated_data['razorpay_order_id']
        razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
        razorpay_signature = serializer.validated_data['razorpay_signature']

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        try:
            # Verify signature
            client.utility.verify_payment_signature(params_dict)
            
            # Signature matches, mark payment as success
            payment, created = Payment.objects.update_or_create(
                order=order,
                defaults={
                    'payment_method': 'razorpay',
                    'transaction_id': razorpay_payment_id,
                    'amount': order.final_amount,
                    'status': 'Completed'
                }
            )
            order.payment_status = 'Paid'
            order.status = 'Confirmed'
            order.save()

            return APIResponse(success=True, message="Payment verified successfully.")
        except razorpay.errors.SignatureVerificationError:
            # Payment verification failed
            order.payment_status = 'Failed'
            order.save()
            return APIResponse(success=False, message="Payment signature verification failed.", status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return APIResponse(success=False, message=str(e), status=status.HTTP_400_BAD_REQUEST)
