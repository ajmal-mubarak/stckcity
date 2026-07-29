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

        statuses = ["PENDING", "CONFIRMED", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"]

        order_status_breakdown = {
            s: Order.objects.filter(status=s).count()
            for s in statuses
        }

        recent_qs = (
            Order.objects
            .select_related("shop", "shop__shop")
            .order_by("-created_at")[:10]
        )

        recent_orders = []
        for o in recent_qs:
            try:
                shop_name = o.shop.shop.shop_name
            except Exception:
                shop_name = o.shop.mobile_number
            recent_orders.append({
                "id": o.id,
                "order_number": o.order_number,
                "shop_name": shop_name,
                "status": o.status,
                "total_amount": str(o.total_amount),
                "created_at": o.created_at,
            })

        data = {
            "total_shops": Shop.objects.count(),
            "active_shops": Shop.objects.filter(status="ACTIVE").count(),
            "total_products": Product.objects.filter(is_active=True).count(),

            "today_orders": Order.objects.filter(created_at__date=today).count(),
            "today_sales": today_sales,
            "total_sales": total_sales,

            "order_status_breakdown": order_status_breakdown,
            "recent_orders": recent_orders,
        }

        return Response(data)