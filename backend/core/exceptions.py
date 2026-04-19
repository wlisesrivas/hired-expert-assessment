from rest_framework.views import exception_handler

_STATUS_CODES = {
    400: "VALIDATION_ERROR",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
}


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    code = _STATUS_CODES.get(response.status_code, "API_ERROR")
    raw = response.data

    if response.status_code == 400 and isinstance(raw, dict):
        message = "Validation failed."
        details = raw
    else:
        message = str(raw.get("detail", exc)) if isinstance(raw, dict) else str(exc)
        details = None

    response.data = {
        "success": False,
        "data": None,
        "error": {"code": code, "message": message, "details": details},
    }
    return response
