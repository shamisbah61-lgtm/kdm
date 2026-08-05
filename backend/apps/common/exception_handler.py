from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler to return error responses in the standard format:
    {
        "success": false,
        "message": "Error details",
        "data": { ... }
    }
    """
    # Call REST framework's default exception handler first to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize the structure of validation/API errors
        data = response.data
        message = "An error occurred."
        
        # If it's a validation error, extract detailed fields
        if isinstance(exc, ValidationError):
            message = "Validation failed."
            # DRF validation errors can be a list or dict. Ensure we pass them in 'data'
            if isinstance(data, dict):
                # E.g., {'email': ['This field is required.']}
                # We can also extract the first error message as the main message for convenience
                first_key = next(iter(data))
                first_val = data[first_key]
                if isinstance(first_val, list) and len(first_val) > 0:
                    message = f"{first_key}: {first_val[0]}"
                elif isinstance(first_val, str):
                    message = f"{first_key}: {first_val}"
            elif isinstance(data, list) and len(data) > 0:
                message = str(data[0])
        else:
            # For other exceptions (PermissionDenied, NotFound, etc.), retrieve the detail message
            if isinstance(data, dict):
                message = data.get("detail", message)
            elif isinstance(data, list) and len(data) > 0:
                message = str(data[0])

        response.data = {
            "success": False,
            "message": str(message),
            "data": data
        }
    else:
        # For non-DRF exceptions (e.g. database errors, runtime errors, etc.)
        # Log the full exception stack trace
        logger.exception("Unhandle exception caught: %s", str(exc))
        
        # In a real environment, we return an Internal Server Error response.
        # If DEBUG is True, we can include the exception details in the message.
        from django.conf import settings
        message = str(exc) if settings.DEBUG else "A server error occurred. Please try again later."
        
        response = Response(
            {
                "success": False,
                "message": message,
                "data": {}
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
