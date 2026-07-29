# pyrefly: ignore [missing-import]
from django.urls import path

from .views import (
    CartAPIView,
    AddToCartAPIView,
    UpdateCartItemAPIView,
    RemoveCartItemAPIView,
    ClearCartAPIView,
    PlaceOrderAPIView,
    MyOrdersAPIView,
    OrderDetailAPIView,
    CancelOrderAPIView,
    AdminOrderListAPIView,
    UpdateOrderStatusAPIView,  

)

urlpatterns = [
    path(
        "cart/",
        CartAPIView.as_view(),
        name="cart",
    ),

    path(
        "cart/add/",
        AddToCartAPIView.as_view(),
        name="cart-add",
    ),

    path(
        "cart/items/<int:pk>/",
        UpdateCartItemAPIView.as_view(),
        name="cart-item-update",
    ),

    path(
        "cart/items/<int:pk>/delete/",
        RemoveCartItemAPIView.as_view(),
        name="cart-item-delete",
    ),
    path(
        "cart/clear/",
        ClearCartAPIView.as_view(),
        name="cart-clear",
    ),

    path(
        "orders/place/",
        PlaceOrderAPIView.as_view(),
        name="place-order",
    ),
    path(
        "orders/my/",
        MyOrdersAPIView.as_view(),
        name="my-orders",
    ),

    path(
        "orders/<int:pk>/",
        OrderDetailAPIView.as_view(),
        name="order-detail",
    ),

    path(
        "orders/<int:pk>/cancel/",
        CancelOrderAPIView.as_view(),
        name="cancel-order",
    ),

    path(
        "admin/orders/",
        AdminOrderListAPIView.as_view(),
        name="admin-orders",
    ),

    path(
        "admin/orders/<int:pk>/status/",
        UpdateOrderStatusAPIView.as_view(),
        name="admin-order-status",
),
]