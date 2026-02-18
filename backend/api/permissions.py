from rest_framework.permissions import BasePermission


class IsAdminOwner(BasePermission):
    """
    Custom permission: only allow access to superusers / staff.
    Used to protect all admin CRUD endpoints.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )
