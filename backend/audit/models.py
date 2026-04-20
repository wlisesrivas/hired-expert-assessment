from django.db import models


class AuditLog(models.Model):
    action = models.CharField(max_length=255)
    user = models.ForeignKey("auth.User", on_delete=models.SET_NULL, null=True, blank=True)
    correlation_id = models.CharField(max_length=255, null=True, blank=True)
    method = models.CharField(max_length=10, null=True, blank=True)
    path = models.CharField(max_length=255, null=True, blank=True)
    status_code = models.IntegerField(null=True, blank=True)
    duration_ms = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.created_at} - {self.action} by User {self.user.id if self.user else 'Anonymous'}"
