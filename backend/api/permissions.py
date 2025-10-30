from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Permission class that only allows admin users to access.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff)
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows read-only access to all authenticated users,
    but only allows write access to admin users.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.role == "admin" or request.user.is_staff


class AllowAnyReadOnly(permissions.BasePermission):
    """
    Permission class that allows unauthenticated read-only access,
    but requires admin authentication for write operations.

    FOR DEVELOPMENT USE ONLY - should be replaced with proper authentication
    in production.
    """

    def has_permission(self, request, view):
        # Allow all GET, HEAD, OPTIONS requests (read-only)
        if request.method in permissions.SAFE_METHODS:
            return True

        # For write operations, require admin user
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff)
        )
