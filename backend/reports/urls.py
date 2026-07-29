# pyrefly: ignore [missing-import]
from django.urls import path

from .views import OrderPDFAPIView, ShopHistoryPDFAPIView, OrderExcelAPIView, ShopHistoryExcelAPIView

urlpatterns = [
    path(
        "reports/orders/pdf/",
        OrderPDFAPIView.as_view(),
        name="orders-pdf",
    ),
    path(
        "reports/shops/<int:shop_id>/history/pdf/",
        ShopHistoryPDFAPIView.as_view(),
        name="shop-history-pdf",
    ),
    path(
        "reports/orders/excel/",
        OrderExcelAPIView.as_view(),
        name="orders-excel",
    ),
    path(
        "reports/shops/<int:shop_id>/history/excel/",
        ShopHistoryExcelAPIView.as_view(),
        name="shop-history-excel",
    ),
]