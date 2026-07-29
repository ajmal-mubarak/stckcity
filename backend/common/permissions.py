# pyrefly: ignore [missing-import]
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
    Admin:
        GET, POST, PUT, PATCH, DELETE

    Shop:
        GET only
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return request.user.is_staff


class IsAdminOnly(BasePermission):
    """
    Only admin users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_staff
        )