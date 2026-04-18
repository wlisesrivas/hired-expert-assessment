from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView


class LoginView(TokenObtainPairView):
    """Wraps SimpleJWT's login response in the standard envelope."""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return Response(
            {"success": True, "data": dict(response.data), "error": None},
            status=response.status_code,
        )
