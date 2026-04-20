import json
import logging
import time
import uuid

from audit.models import AuditLog

logger = logging.getLogger(__name__)


class CorrelationIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        correlation_id = str(uuid.uuid4())
        request.correlation_id = correlation_id

        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = round((time.monotonic() - start) * 1000)

        if request.path.startswith("/admin/"):
            # skip admin urls
            return response

        # Save log to database
        audit = AuditLog.objects.create(
            action=f"{request.method} {request.path}",
            user=request.user if request.user.is_authenticated else None,
            correlation_id=correlation_id,
            method=request.method,
            path=request.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )

        # print log in terminal
        logger.info(
            json.dumps(
                {
                    "correlation_id": audit.correlation_id,
                    "method": audit.method,
                    "path": audit.path,
                    "status_code": audit.status_code,
                    "duration_ms": audit.duration_ms,
                    "record_id": audit.id,
                }
            )
        )
        response["X-Correlation-ID"] = audit.correlation_id
        return response
