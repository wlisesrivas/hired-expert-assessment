import logging

from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from . import services
from .models import Product
from .pagination import ProductPagination
from .serializers import ProductSerializer


logger = logging.getLogger(__name__)


def _ok(data=None, status=200):
    return Response({"success": True, "data": data, "error": None}, status=status)


class _SearchThrottle(ScopedRateThrottle):
    scope = "products_search"


class ProductViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_throttles(self):
        if self.action == "list":
            return [_SearchThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        logger.info(f"Fetching products with params: {self.request.query_params}")
        return services.get_queryset(self.request.query_params)

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        logger.info(f"Fetching product with ID: {self.kwargs['pk']}")
        return _ok(self.get_serializer(self.get_object()).data)

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating product with data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = services.create(serializer.validated_data)
        logger.info(f"Product created with ID: {product.id}")
        return _ok(ProductSerializer(product).data, status=201)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = services.update(instance, serializer.validated_data)
        logger.info(f"Product updated with ID: {product.id}")
        return _ok(ProductSerializer(product).data)

    def destroy(self, request, *args, **kwargs):
        logger.info(f"Deleting product with ID: {self.kwargs['pk']}")
        services.soft_delete(self.get_object())
        return _ok()
