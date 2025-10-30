from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import FuelTank


class Command(BaseCommand):
    help = "Seed the database with 7 fuel tanks (T1-T7)"

    def handle(self, *args, **options):
        self.stdout.write("Seeding fuel tanks...")

        tanks_data = [
            {
                "tank_id": "T1",
                "tank_name": "Tank 1 - Jet A",
                "fuel_type": "jet_a",
                "capacity_gallons": 12000,
                "min_level_inches": 16,
                "max_level_inches": 86,
                "usable_min_inches": 16,
                "usable_max_inches": 86,
            },
            {
                "tank_id": "T2",
                "tank_name": "Tank 2 - Jet A",
                "fuel_type": "jet_a",
                "capacity_gallons": 12000,
                "min_level_inches": 16,
                "max_level_inches": 86,
                "usable_min_inches": 16,
                "usable_max_inches": 86,
            },
            {
                "tank_id": "T3",
                "tank_name": "Tank 3 - Jet A",
                "fuel_type": "jet_a",
                "capacity_gallons": 12000,
                "min_level_inches": 16,
                "max_level_inches": 86,
                "usable_min_inches": 16,
                "usable_max_inches": 86,
            },
            {
                "tank_id": "T4",
                "tank_name": "Tank 4 - Jet A",
                "fuel_type": "jet_a",
                "capacity_gallons": 12000,
                "min_level_inches": 16,
                "max_level_inches": 86,
                "usable_min_inches": 16,
                "usable_max_inches": 86,
            },
            {
                "tank_id": "T5",
                "tank_name": "Tank 5 - Avgas",
                "fuel_type": "avgas",
                "capacity_gallons": 12000,
                "min_level_inches": 16,
                "max_level_inches": 86,
                "usable_min_inches": 16,
                "usable_max_inches": 86,
            },
            {
                "tank_id": "T6",
                "tank_name": "Tank 6 - Avgas",
                "fuel_type": "avgas",
                "capacity_gallons": 12000,
                "min_level_inches": 16,
                "max_level_inches": 86,
                "usable_min_inches": 16,
                "usable_max_inches": 86,
            },
            {
                "tank_id": "T7",
                "tank_name": "Tank 7 - Jet A",
                "fuel_type": "jet_a",
                "capacity_gallons": 12000,
                "min_level_inches": 16,
                "max_level_inches": 86,
                "usable_min_inches": 16,
                "usable_max_inches": 86,
            },
        ]

        with transaction.atomic():
            created_count = 0
            updated_count = 0

            for tank_data in tanks_data:
                tank, created = FuelTank.objects.update_or_create(
                    tank_id=tank_data["tank_id"], defaults=tank_data
                )

                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Created tank: {tank.tank_id}")
                    )
                else:
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f"↻ Updated tank: {tank.tank_id}")
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSeeding complete! Created: {created_count}, Updated: {updated_count}"
            )
        )
