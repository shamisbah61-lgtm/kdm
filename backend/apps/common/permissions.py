from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow administrators to edit objects.
    Read-only requests are allowed for anonymous users.
    """
    def has_permission(self, request, view):
        # Safe methods (GET, HEAD, OPTIONS) are allowed for anyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed for staff/admin users
        return bool(request.user and request.user.is_staff)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Safe methods are allowed
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Object must have a 'user' or 'seller' attribute that equals request.user
        owner = getattr(obj, 'user', None) or getattr(obj, 'seller', None)
        return bool(request.user and owner == request.user)

class IsSellerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission:
    - Anyone can read.
    - Authenticated users can create.
    - Only the seller of the product or admin can edit/delete.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and (request.user.is_staff or getattr(obj, 'seller', None) == request.user))
