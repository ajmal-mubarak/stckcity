# pyrefly: ignore [missing-import]
from django.shortcuts import get_object_or_404

# pyrefly: ignore [missing-import]
from rest_framework import generics, status
# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView

# pyrefly: ignore [missing-import]
from rest_framework.generics import get_object_or_404

# pyrefly: ignore [missing-import]
from drf_spectacular.utils import extend_schema

from catalog.models import Product
from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    PlaceOrderSerializer,
    OrderSerializer,
    OrderListSerializer,
    AdminOrderSerializer,
    UpdateOrderStatusSerializer
)
from decimal import Decimal
# pyrefly: ignore [missing-import]
from django.db import transaction

from .models import Order, OrderItem

from django_filters.rest_framework import DjangoFilterBackend
# pyrefly: ignore [missing-import]
from rest_framework import filters
# pyrefly: ignore [missing-import]
from common.permissions import IsAdminOnly

class CartAPIView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(
            shop=self.request.user
        )
        return cart


class AddToCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=AddToCartSerializer,
        responses=CartSerializer,
    )
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = get_object_or_404(
            Product,
            id=serializer.validated_data["product"],
            is_active=True,
        )

        quantity = serializer.validated_data["quantity"]

        cart, _ = Cart.objects.get_or_create(shop=request.user)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={
                "quantity": quantity,
                "unit_price": product.price,
            },
        )

        if not created:
            item.quantity += quantity
            item.save()

        return Response(
            CartSerializer(
                cart,
                context={"request": request},
            ).data
        )

class UpdateCartItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=UpdateCartItemSerializer,
        responses=CartSerializer,
    )
    def patch(self, request, pk):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = get_object_or_404(
            Cart,
            shop=request.user
        )

        item = get_object_or_404(
            CartItem,
            id=pk,
            cart=cart
        )

        item.quantity = serializer.validated_data["quantity"]
        item.save()

        return Response(
            CartSerializer(
                cart,
                context={"request": request}
            ).data
        )


class RemoveCartItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={204: None}
    )
    def delete(self, request, pk):
        cart = get_object_or_404(
            Cart,
            shop=request.user
        )

        item = get_object_or_404(
            CartItem,
            id=pk,
            cart=cart
        )

        item.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

class ClearCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={204: None}
    )
    def delete(self, request):
        cart = get_object_or_404(
            Cart,
            shop=request.user
        )

        cart.items.all().delete()

        return Response(status=status.HTTP_204_NO_CONTENT)



class PlaceOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=PlaceOrderSerializer,
        responses=OrderSerializer,
    )
    @transaction.atomic
    def post(self, request):

        serializer = PlaceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = get_object_or_404(
            Cart,
            shop=request.user
        )

        cart_items = cart.items.select_related("product")

        if not cart_items.exists():
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = Order.objects.create(
            shop=request.user,
            required_date=serializer.validated_data["required_date"],
            notes=serializer.validated_data.get("notes", ""),
        )

        total = Decimal("0.00")

        for item in cart_items:

            if item.product.stock < item.quantity:
                return Response(
                    {
                        "detail": f"Not enough stock for {item.product.name}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            subtotal = item.quantity * item.unit_price

            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=subtotal,
            )

            item.product.stock -= item.quantity
            item.product.save()

            total += subtotal

        order.total_amount = total
        order.save()

        cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class MyOrdersAPIView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(shop=self.request.user)
            .order_by("-created_at")
        )

class OrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            shop=self.request.user
        )

class CancelOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        order = get_object_or_404(
            Order,
            id=pk,
            shop=request.user
        )

        if order.status != "PENDING":
            return Response(
                {
                    "detail": "Only pending orders can be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "CANCELLED"
        order.cancel_reason = request.data.get(
            "reason",
            ""
        )

        order.save()

        return Response(
            {
                "message": "Order cancelled successfully."
            }
        )

class AdminOrderListAPIView(generics.ListAPIView):
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminOnly]

    queryset = Order.objects.all().order_by("-created_at")

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "status",
        "required_date",
    ]

    search_fields = [
        "shop_name",
        "shop_mobile",
        "order_number",
    ]

    ordering_fields = [
        "created_at",
        "total_amount",
    ]

class UpdateOrderStatusAPIView(APIView):
    permission_classes = [IsAdminOnly]

    @extend_schema(
        request=UpdateOrderStatusSerializer,
        responses=AdminOrderSerializer,
    )
    def patch(self, request, pk):

        order = get_object_or_404(Order, pk=pk)

        serializer = UpdateOrderStatusSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        order.status = serializer.validated_data["status"]
        order.save()

        return Response(
            AdminOrderSerializer(order).data
        )