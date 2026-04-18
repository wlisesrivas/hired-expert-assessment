from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from products.models import Product


class Command(BaseCommand):
    help = "Create initial demo user and sample products."

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-user",
            action="store_true",
            help="Skip user creation.",
        )
        parser.add_argument(
            "--skip-products",
            action="store_true",
            help="Skip product creation.",
        )

    def handle(self, *args, **options):
        if not options["skip_user"]:
            self._create_user()
        if not options["skip_products"]:
            self._create_products()
        self.stdout.write(self.style.SUCCESS("✓ Initial data setup complete."))

    def _create_user(self):
        if User.objects.filter(username="admin").exists():
            self.stdout.write(self.style.WARNING("  ⊘ User 'admin' already exists."))
            return
        User.objects.create_superuser("admin", "admin@example.com", "admin123")
        self.stdout.write(self.style.SUCCESS("  ✓ Created superuser: admin / admin123"))

    def _create_products(self):
        if Product.objects.exists():
            self.stdout.write(self.style.WARNING("  ⊘ Products already exist."))
            return

        products = [
            Product(
                name="Wireless Headphones",
                description="Noise-canceling Bluetooth headphones with 30-hour battery.",
                price=Decimal("149.99"),
                category="electronics",
                stock=45,
            ),
            Product(
                name="USB-C Cable",
                description="High-quality 6ft USB-C charging and data cable.",
                price=Decimal("12.99"),
                category="electronics",
                stock=200,
            ),
            Product(
                name="Desk Lamp",
                description="LED desk lamp with adjustable brightness and color temp.",
                price=Decimal("39.99"),
                category="lighting",
                stock=30,
            ),
            Product(
                name="Mechanical Keyboard",
                description="RGB mechanical keyboard with Cherry MX switches.",
                price=Decimal("129.99"),
                category="electronics",
                stock=25,
            ),
            Product(
                name="Mouse Pad",
                description="Large extended mouse pad with non-slip base.",
                price=Decimal("19.99"),
                category="accessories",
                stock=80,
            ),
        ]
        Product.objects.bulk_create(products)
        self.stdout.write(self.style.SUCCESS(f"  ✓ Created {len(products)} sample products."))
