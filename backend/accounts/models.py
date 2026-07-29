# pyrefly: ignore [missing-import]
from django.db import models
# pyrefly: ignore [missing-import]
from django.contrib.auth.models import AbstractUser
from .managers import UserManager


class User(AbstractUser):
    username = None

    mobile_number = models.CharField(
        max_length=15,
        unique=True,
    )

    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "mobile_number"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.mobile_number


class Shop(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="shop",
    )

    owner_name = models.CharField(
        max_length=150
    )

    shop_name = models.CharField(
        max_length=200
    )

    place = models.CharField(
        max_length=200
    )

    address = models.TextField(
        blank=True
    )

    pin_code = models.CharField(
        max_length=10,
        blank=True
    )

    gst_number = models.CharField(
        max_length=20,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.shop_name