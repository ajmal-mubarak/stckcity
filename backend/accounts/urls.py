# pyrefly: ignore [missing-import]
from django.urls import path

from .views import (
    RegisterAPIView,
    LoginAPIView,
    ShopListAPIView,
    ShopStatusUpdateAPIView,
)

urlpatterns = [
    path(
        "register/",
        RegisterAPIView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginAPIView.as_view(),
        name="login",
    ),

    path(
        "shops/",
        ShopListAPIView.as_view(),
        name="shop-list",
    ),

    path(
        "shops/<int:pk>/status/",
        ShopStatusUpdateAPIView.as_view(),
        name="shop-status-update",
    ),
]