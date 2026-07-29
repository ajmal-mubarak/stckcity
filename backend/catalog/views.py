# pyrefly: ignore [missing-import]
from rest_framework import viewsets
# pyrefly: ignore [missing-import]
from common.permissions import IsAdminOrReadOnly
# pyrefly: ignore [missing-import]
from django_filters.rest_framework import DjangoFilterBackend
# pyrefly: ignore [missing-import]
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Brand, Category, Product
# pyrefly: ignore [missing-import]
from .serializers import BrandSerializer, CategorySerializer, ProductSerializer


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by("name")
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related(
        "brand",
        "category",
    ).prefetch_related(
        "images",
    )

    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "brand",
        "category",
        "is_active",
    ]

    search_fields = [
        "name",
        "description",
    ]

    ordering_fields = [
        "price",
        "stock",
        "created_at",
        "name",
    ]

    ordering = [
        "name",
    ]