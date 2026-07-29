# pyrefly: ignore [missing-import]
from rest_framework import generics, permissions
from .serializers import RegisterSerializer
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView

# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.tokens import RefreshToken

from .auth_serializers import LoginSerializer
from .models import Shop


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginAPIView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        if hasattr(user, "shop") and user.shop.status != "ACTIVE":
            return Response(
                {"message": "Your account is waiting for admin approval."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "mobile_number": user.mobile_number,
                "is_staff": user.is_staff,
            },
        }

        if hasattr(user, "shop"):
            data["shop"] = {
                "shop_name": user.shop.shop_name,
                "owner_name": user.shop.owner_name,
                "status": user.shop.status,
            }

        return Response(data)


class ShopListAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get("status", None)
        shops = Shop.objects.select_related("user").all().order_by("-created_at")
        if status_filter:
            shops = shops.filter(status=status_filter.upper())
        data = [
            {
                "id": shop.id,
                "shop_name": shop.shop_name,
                "owner_name": shop.owner_name,
                "place": shop.place,
                "mobile_number": shop.user.mobile_number,
                "status": shop.status,
                "created_at": shop.created_at,
            }
            for shop in shops
        ]
        return Response(data)


class ShopStatusUpdateAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({"detail": "Shop not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if new_status not in [Shop.Status.ACTIVE, Shop.Status.PENDING, Shop.Status.INACTIVE]:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

        shop.status = new_status
        shop.save()
        return Response({"id": shop.id, "status": shop.status})