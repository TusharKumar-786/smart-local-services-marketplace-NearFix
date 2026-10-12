"""Consistent error format for every API error.

Every error response looks like:
    {"detail": "Human readable message", "errors": {"field": ["problem"]}}
"""
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    data = response.data
    if isinstance(data, dict) and set(data.keys()) <= {"detail", "code", "messages"}:
        message = str(data.get("detail", "Request failed."))
        errors = {}
    elif isinstance(data, dict):
        errors = data
        non_field = data.get("non_field_errors")
        message = str(non_field[0]) if non_field else "Please correct the highlighted fields."
    elif isinstance(data, list):
        errors = {"non_field_errors": data}
        message = str(data[0]) if data else "Request failed."
    else:
        errors = {}
        message = str(data)

    response.data = {"detail": message, "errors": errors}
    return response
