from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """
    Only allow access to the platform super admin.
    Checks the Profile.is_platform_admin flag.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, 'profile', None)
        return profile and profile.is_platform_admin
