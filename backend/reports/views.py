# pyrefly: ignore [missing-import]
from django.http import HttpResponse

# pyrefly: ignore [missing-import]
from rest_framework.views import APIView

# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAdminUser

from orders.models import Order
from .pdf import generate_orders_pdf
from .excel import generate_orders_excel

# pyrefly: ignore [missing-import]
from django.shortcuts import get_object_or_404

from accounts.models import Shop

from .excel import generate_shop_history_excel

from .pdf import generate_shop_history_pdf


class OrderPDFAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):

        queryset = Order.objects.all().order_by("-created_at")

        status = request.GET.get("status")
        if status:
            queryset = queryset.filter(status=status)

        shop = request.GET.get("shop")
        if shop:
            queryset = queryset.filter(shop_id=shop)

        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")

        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        pdf = generate_orders_pdf(queryset)

        return HttpResponse(
            pdf,
            content_type="application/pdf",
        )

class ShopHistoryPDFAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, shop_id):

        shop = get_object_or_404(
            Shop,
            id=shop_id
        )

        orders = (
            Order.objects
            .filter(shop=shop.user)
            .order_by("-created_at")
        )

        pdf = generate_shop_history_pdf(
            shop,
            orders
        )

        return HttpResponse(
            pdf,
            content_type="application/pdf",
        )

class OrderExcelAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):

        queryset = Order.objects.all().order_by("-created_at")

        status = request.GET.get("status")
        if status:
            queryset = queryset.filter(status=status)

        shop = request.GET.get("shop")
        if shop:
            queryset = queryset.filter(shop_id=shop)

        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")

        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        workbook = generate_orders_excel(queryset)

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        response["Content-Disposition"] = (
            'attachment; filename="orders.xlsx"'
        )

        workbook.save(response)

        return response

class ShopHistoryExcelAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, shop_id):

        shop = get_object_or_404(
            Shop,
            id=shop_id,
        )

        orders = (
            Order.objects
            .filter(shop=shop.user)
            .order_by("-created_at")
        )

        workbook = generate_shop_history_excel(
            shop,
            orders,
        )

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        response[
            "Content-Disposition"
        ] = f'attachment; filename="{shop.shop_name}_history.xlsx"'

        workbook.save(response)

        return response