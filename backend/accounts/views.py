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