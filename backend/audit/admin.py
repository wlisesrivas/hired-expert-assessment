from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditAdmin(admin.ModelAdmin):
    list_display = ("correlation_id", "method", "path", "status_code", "duration_ms", "created_at")
    list_filter = ("method", "status_code")
    search_fields = ("correlation_id", "path")
    readonly_fields = (
        "id",
        "correlation_id",
        "method",
        "path",
        "status_code",
        "duration_ms",
        "created_at"
    )
