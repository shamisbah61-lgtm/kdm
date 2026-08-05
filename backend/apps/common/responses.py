from rest_framework.response import Response
from rest_framework import status

class APIResponse(Response):
    """
    Standard API Response class to format all responses as:
    {
        "success": bool,
        "message": str,
        "data": dict/list
    }
    """
    def __init__(self, success=True, message="", data=None, status=status.HTTP_200_OK, headers=None, exception=False, content_type=None):
        payload = {
            "success": success,
            "message": message,
            "data": data if data is not None else {}
        }
        super().__init__(data=payload, status=status, headers=headers, exception=exception, content_type=content_type)
