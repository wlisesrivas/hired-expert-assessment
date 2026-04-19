import json
import logging
import time
import uuid

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

        logger.info(
            json.dumps(
                {
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.path,
                    "status": response.status_code,
                    "duration_ms": duration_ms,
                }
            )
        )
        response["X-Correlation-ID"] = correlation_id
        return response
