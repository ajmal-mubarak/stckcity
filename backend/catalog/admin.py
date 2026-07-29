# pyrefly: ignore [missing-import]
from django.contrib import admin
from .models import (
    Brand,
    Category,
    Product,
    ProductImage,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "is_active",
    )

    search_fields = (
        "name",
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "is_active",
    )

    search_fields = (
        "name",
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "brand",
        "category",
        "price",
        "stock",
        "is_active",
    )

    list_filter = (
        "brand",
        "category",
        "is_active",
    )

    search_fields = (
        "name",
    )

    inlines = [
        ProductImageInline,
    ]