# pyrefly: ignore [missing-import]
from rest_framework import viewsets
# pyrefly: ignore [missing-import]
from common.permissions import IsAdminOrReadOnly
# pyrefly: ignore [missing-import]
from django_filters.rest_framework import DjangoFilterBackend
# pyrefly: ignore [missing-import]
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Brand, Category, Product, ProductImage
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

    def _handle_image(self, product, request):
        """Save uploaded image file as a ProductImage for this product."""
        image_file = request.FILES.get("image")
        if image_file:
            ProductImage.objects.create(product=product, image=image_file)

    def perform_create(self, serializer):
        product = serializer.save()
        self._handle_image(product, self.request)

    def perform_update(self, serializer):
        product = serializer.save()
        # Replace the first image if a new one is uploaded
        image_file = self.request.FILES.get("image")
        if image_file:
            product.images.all().delete()
            ProductImage.objects.create(product=product, image=image_file)