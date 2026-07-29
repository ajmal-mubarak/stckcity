# pyrefly: ignore [missing-import]
from django.contrib.auth import get_user_model
# pyrefly: ignore [missing-import]
from rest_framework import serializers
from .models import Shop

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(write_only=True)
    shop_name = serializers.CharField(write_only=True)
    place = serializers.CharField(write_only=True)
    address = serializers.CharField(required=False, allow_blank=True)
    pin_code = serializers.CharField(required=False, allow_blank=True)
    gst_number = serializers.CharField(required=False, allow_blank=True)

    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "mobile_number",
            "password",
            "confirm_password",
            "owner_name",
            "shop_name",
            "place",
            "address",
            "pin_code",
            "gst_number",
        ]

    def validate_mobile_number(self, value):
        if User.objects.filter(mobile_number=value).exists():
            raise serializers.ValidationError(
                "Mobile number is already registered."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        owner_name = validated_data.pop("owner_name")
        shop_name = validated_data.pop("shop_name")
        place = validated_data.pop("place")
        address = validated_data.pop("address", "")
        pin_code = validated_data.pop("pin_code", "")
        gst_number = validated_data.pop("gst_number", "")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        shop = Shop.objects.create(
            user=user,
            owner_name=owner_name,
            shop_name=shop_name,
            place=place,
            address=address,
            pin_code=pin_code,
            gst_number=gst_number,
        )

        return user

    def to_representation(self, instance):
        shop = instance.shop

        return {
            "message": "Registration successful.",
            "user": {
                "id": instance.id,
                "mobile_number": instance.mobile_number,
            },
            "shop": {
                "owner_name": shop.owner_name,
                "shop_name": shop.shop_name,
                "place": shop.place,
                "address": shop.address,
                "pin_code": shop.pin_code,
                "gst_number": shop.gst_number,
                "status": shop.status,
            },
        }