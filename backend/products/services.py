from .models import Product


def get_queryset(params):
    qs = Product.objects.all()

    category = params.get("category")
    if category:
        qs = qs.filter(category__iexact=category)

    is_active = params.get("is_active")
    if is_active is not None:
        qs = qs.filter(is_active=(is_active.lower() == "true"))

    return qs


def create(validated_data):
    return Product.objects.create(**validated_data)


def update(instance, validated_data):
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    instance.save()
    return instance


def soft_delete(instance):
    instance.is_active = False
    instance.save()
