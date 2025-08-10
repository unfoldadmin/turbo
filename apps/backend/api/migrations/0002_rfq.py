from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="RFQ",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("partnumber", models.CharField(max_length=255, verbose_name="part number")),
                ("brand", models.CharField(blank=True, default="", max_length=255, verbose_name="brand")),
                ("qty", models.PositiveIntegerField(default=1, verbose_name="quantity")),
                (
                    "target_price",
                    models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name="target price"),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="created at")),
                ("modified_at", models.DateTimeField(auto_now=True, verbose_name="modified at")),
            ],
            options={
                "db_table": "rfqs",
                "verbose_name": "RFQ",
                "verbose_name_plural": "RFQs",
                "ordering": ["-created_at"],
            },
        ),
    ]


