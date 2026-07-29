# pyrefly: ignore [missing-import]
from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    image = serializers.SerializerMethodField()

    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_name",
            "image",
            "quantity",
            "unit_price",
            "subtotal",
        )

    def get_image(self, obj):
        image = obj.product.images.first()

        if image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(image.image.url)
            return image.image.url

        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = (
            "id",
            "items",
            "total",
        )

    def get_total(self, obj):
        return sum(
            item.subtotal
            for item in obj.items.all()
        )


class AddToCartSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)




class PlaceOrderSerializer(serializers.Serializer):
    required_date = serializers.DateField()
    notes = serializers.CharField(
        required=False,
        allow_blank=True
    )


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "quantity",
            "unit_price",
            "subtotal",
        )


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "status",
            "required_date",
            "notes",
            "total_amount",
            "created_at",
            "items",
        )

class OrderListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "status",
            "total_amount",
            "required_date",
            "created_at",
        )

class AdminOrderSerializer(serializers.ModelSerializer):
    shop_name = serializers.CharField(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "shop_name",
            "status",
            "total_amount",
            "required_date",
            "created_at",
        )

class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=Order.STATUS_CHOICES
    )