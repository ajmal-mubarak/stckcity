# pyrefly: ignore [missing-import]
from django.contrib.auth import authenticate
# pyrefly: ignore [missing-import]
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    mobile_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        mobile = attrs.get("mobile_number")
        password = attrs.get("password")

        user = authenticate(
            username=mobile,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid mobile number or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        attrs["user"] = user
        return attrs