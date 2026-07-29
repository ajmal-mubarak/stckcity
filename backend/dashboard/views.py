from decimal import Decimal
# pyrefly: ignore [missing-import]
from django.db.models import Sum
# pyrefly: ignore [missing-import]
from django.utils import timezone
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAdminUser
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from accounts.models import Shop
# pyrefly: ignore [missing-import]
from catalog.models import Product
from orders.models import Order


class DashboardAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()

        total_sales = (
            Order.objects.filter(status="DELIVERED")
            .aggregate(total=Sum("total_amount"))["total"]
            or Decimal("0.00")
        )

        today_sales = (
            Order.objects.filter(
                status="DELIVERED",
                created_at__date=today,
            ).aggregate(total=Sum("total_amount"))["total"]
            or Decimal("0.00")
        )

        data = {
            "total_shops": Shop.objects.count(),
            "active_shops": Shop.objects.filter(status="ACTIVE").count(),
            "total_products": Product.objects.filter(is_active=True).count(),

            "pending_orders": Order.objects.filter(status="PENDING").count(),
            "confirmed_orders": Order.objects.filter(status="CONFIRMED").count(),
            "packed_orders": Order.objects.filter(status="PACKED").count(),
            "dispatched_orders": Order.objects.filter(status="DISPATCHED").count(),
            "delivered_orders": Order.objects.filter(status="DELIVERED").count(),
            "cancelled_orders": Order.objects.filter(status="CANCELLED").count(),

            "today_orders": Order.objects.filter(created_at__date=today).count(),

            "today_sales": today_sales,
            "total_sales": total_sales,
        }

        return Response(data)