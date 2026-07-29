# pyrefly: ignore [missing-import]
from django.contrib import admin
# pyrefly: ignore [missing-import]
from django.contrib.auth.admin import UserAdmin
from .models import User, Shop


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    ordering = ("id",)

    list_display = (
        "mobile_number",
        "is_staff",
        "is_superuser",
        "is_active",
    )

    search_fields = (
        "mobile_number",
    )

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "mobile_number",
                    "password",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "mobile_number",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = (
        "shop_name",
        "owner_name",
        "user",
        "place",
        "status",
    )

    search_fields = (
        "shop_name",
        "owner_name",
        "user__mobile_number",
    )

    list_filter = (
        "status",
        "place",
    )