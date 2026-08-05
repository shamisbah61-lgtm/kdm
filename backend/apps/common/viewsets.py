from rest_framework import viewsets, status
from apps.common.responses import APIResponse

class BaseModelViewSet(viewsets.ModelViewSet):
    """
    A base ModelViewSet that automatically wraps list, retrieve, create, update, and delete
    operations in the standard JSON response format.
    """
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            # The custom pagination class will format the response
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse(
            success=True,
            message="Data retrieved successfully.",
            data=serializer.data
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse(
            success=True,
            message="Item retrieved successfully.",
            data=serializer.data
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return APIResponse(
            success=True,
            message="Item created successfully.",
            data=serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse(
            success=True,
            message="Item updated successfully.",
            data=serializer.data
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse(
            success=True,
            message="Item deleted successfully.",
            status=status.HTTP_200_OK  # Standard JSON status code returning message
        )
