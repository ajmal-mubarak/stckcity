# pyrefly: ignore [missing-import]
from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product",
        "quantity",
        "unit_price",
        "subtotal",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "order_number",
        "get_shop_name",
        "get_place",
        "get_mobile",
        "status",
        "total_amount",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "order_number",
        "shop__mobile_number",
        "shop__shop__shop_name",
        "shop__shop__place",
    )

    readonly_fields = (
        "order_number",
        "get_shop_name",
        "get_place",
        "get_address",
        "get_mobile",
        "created_at",
        "updated_at",
    )

    fields = (
        "order_number",
        "shop",
        "get_shop_name",
        "get_place",
        "get_address",
        "get_mobile",
        "status",
        "required_date",
        "total_amount",
        "notes",
        "cancel_reason",
        "created_at",
        "updated_at",
    )

    inlines = [OrderItemInline]

    # ── helper methods ──────────────────────────────────────────

    @admin.display(description="Shop Name")
    def get_shop_name(self, obj):
        try:
            return obj.shop.shop.shop_name
        except Exception:
            return "—"

    @admin.display(description="Place")
    def get_place(self, obj):
        try:
            return obj.shop.shop.place
        except Exception:
            return "—"

    @admin.display(description="Address")
    def get_address(self, obj):
        try:
            return obj.shop.shop.address or "—"
        except Exception:
            return "—"

    @admin.display(description="Mobile")
    def get_mobile(self, obj):
        return obj.shop.mobile_number