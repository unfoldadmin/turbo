from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Extended User model for FBO operations"""

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("user", "User"),
    ]

    role = models.CharField(
        _("Role"), max_length=10, choices=ROLE_CHOICES, default="user"
    )
    phone_number = models.CharField(_("Phone Number"), max_length=20, blank=True)
    employee_id = models.CharField(
        _("Employee ID"), max_length=50, blank=True, unique=True, null=True
    )
    is_active_fueler = models.BooleanField(_("Is Active Fueler"), default=False)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "users"
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return self.email if self.email else self.username


class FuelTank(models.Model):
    """Fuel tank configuration and metadata"""

    FUEL_TYPE_CHOICES = [
        ("jet_a", "Jet A"),
        ("avgas", "Avgas"),
    ]

    tank_id = models.CharField(_("Tank ID"), max_length=10, primary_key=True)
    tank_name = models.CharField(_("Tank Name"), max_length=100)
    fuel_type = models.CharField(_("Fuel Type"), max_length=10, choices=FUEL_TYPE_CHOICES)
    capacity_gallons = models.DecimalField(
        _("Capacity (Gallons)"), max_digits=10, decimal_places=2
    )
    min_level_inches = models.DecimalField(
        _("Minimum Level (Inches)"), max_digits=6, decimal_places=2
    )
    max_level_inches = models.DecimalField(
        _("Maximum Level (Inches)"), max_digits=6, decimal_places=2
    )
    usable_min_inches = models.DecimalField(
        _("Usable Minimum (Inches)"), max_digits=6, decimal_places=2
    )
    usable_max_inches = models.DecimalField(
        _("Usable Maximum (Inches)"), max_digits=6, decimal_places=2
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "fuel_tank"
        verbose_name = _("Fuel Tank")
        verbose_name_plural = _("Fuel Tanks")

    def __str__(self):
        return f"{self.tank_id} - {self.tank_name}"


class TankLevelReading(models.Model):
    """Read-only model for existing tank_level_readings table"""

    tank_id = models.CharField(_("Tank ID"), max_length=10)
    level = models.DecimalField(_("Level"), max_digits=6, decimal_places=2)
    recorded_at = models.DateTimeField(_("Recorded At"))
    created_at = models.DateTimeField(_("Created At"))

    class Meta:
        db_table = "tank_level_readings"
        managed = False  # Django won't create/modify this table
        verbose_name = _("Tank Level Reading")
        verbose_name_plural = _("Tank Level Readings")
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.tank_id} - {self.level} @ {self.recorded_at}"


class Aircraft(models.Model):
    """Aircraft registry"""

    tail_number = models.CharField(_("Tail Number"), max_length=20, primary_key=True)
    aircraft_type = models.CharField(_("Aircraft Type"), max_length=50)
    airline_icao = models.CharField(_("Airline ICAO"), max_length=10, blank=True)
    fleet_id = models.CharField(_("Fleet ID"), max_length=50, blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "aircraft"
        verbose_name = _("Aircraft")
        verbose_name_plural = _("Aircraft")

    def __str__(self):
        return f"{self.tail_number} ({self.aircraft_type})"


class TerminalGate(models.Model):
    """Airport terminal gates"""

    terminal_id = models.CharField(_("Terminal ID"), max_length=20)
    terminal_num = models.CharField(_("Terminal Number"), max_length=10)
    gate_number = models.CharField(_("Gate Number"), max_length=10)
    location_id = models.CharField(_("Location ID"), max_length=50, blank=True)
    display_order = models.IntegerField(_("Display Order"), default=0)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "terminal_gate"
        verbose_name = _("Terminal Gate")
        verbose_name_plural = _("Terminal Gates")
        ordering = ["display_order", "terminal_num", "gate_number"]
        unique_together = [["terminal_num", "gate_number"]]

    def __str__(self):
        return f"Terminal {self.terminal_num} - Gate {self.gate_number}"


class Flight(models.Model):
    """Flight information and tracking"""

    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("arrived", "Arrived"),
        ("departed", "Departed"),
        ("cancelled", "Cancelled"),
        ("delayed", "Delayed"),
    ]

    flight_number = models.CharField(_("Flight Number"), max_length=20)
    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="flights",
        verbose_name=_("Aircraft"),
    )
    gate = models.ForeignKey(
        TerminalGate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="flights",
        verbose_name=_("Gate"),
    )
    arrival_time = models.DateTimeField(_("Arrival Time"), null=True, blank=True)
    departure_time = models.DateTimeField(_("Departure Time"))
    flight_status = models.CharField(
        _("Flight Status"), max_length=20, choices=STATUS_CHOICES, default="scheduled"
    )
    destination = models.CharField(_("Destination"), max_length=100, blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "flight"
        verbose_name = _("Flight")
        verbose_name_plural = _("Flights")
        ordering = ["-departure_time"]

    def __str__(self):
        return f"{self.flight_number} - {self.departure_time}"


class Fueler(models.Model):
    """Fueler employee profiles"""

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="fueler_profile",
        verbose_name=_("User"),
    )
    fueler_name = models.CharField(_("Fueler Name"), max_length=100)
    handheld_name = models.CharField(
        _("Handheld Name"), max_length=50, blank=True, help_text=_("Name used on handheld devices")
    )
    status = models.CharField(
        _("Status"), max_length=10, choices=STATUS_CHOICES, default="active"
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "fueler"
        verbose_name = _("Fueler")
        verbose_name_plural = _("Fuelers")

    def __str__(self):
        return self.fueler_name


class Training(models.Model):
    """Training course definitions"""

    training_name = models.CharField(_("Training Name"), max_length=200)
    description = models.TextField(_("Description"), blank=True)
    validity_period_days = models.IntegerField(
        _("Validity Period (Days)"),
        help_text=_("Number of days the training is valid"),
    )
    aircraft_type = models.CharField(
        _("Aircraft Type"),
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Specific aircraft type (if applicable)"),
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "training"
        verbose_name = _("Training")
        verbose_name_plural = _("Trainings")

    def __str__(self):
        return self.training_name


class FuelerTraining(models.Model):
    """Fueler training certifications"""

    fueler = models.ForeignKey(
        Fueler,
        on_delete=models.CASCADE,
        related_name="certifications",
        verbose_name=_("Fueler"),
    )
    training = models.ForeignKey(
        Training,
        on_delete=models.CASCADE,
        related_name="certifications",
        verbose_name=_("Training"),
    )
    completed_date = models.DateField(_("Completed Date"))
    expiry_date = models.DateField(_("Expiry Date"))
    certified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="certifications_issued",
        verbose_name=_("Certified By"),
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "fueler_training"
        verbose_name = _("Fueler Training")
        verbose_name_plural = _("Fueler Trainings")
        unique_together = [["fueler", "training"]]
        ordering = ["-expiry_date"]

    def __str__(self):
        return f"{self.fueler.fueler_name} - {self.training.training_name}"


class FuelTransaction(models.Model):
    """Fuel dispatch transactions"""

    PROGRESS_CHOICES = [
        ("started", "Started"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    SYNC_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("synced", "Synced"),
        ("failed", "Failed"),
    ]

    flight = models.ForeignKey(
        Flight,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="fuel_transactions",
        verbose_name=_("Flight"),
    )
    ticket_number = models.CharField(_("Ticket Number"), max_length=50, unique=True)
    quantity_gallons = models.DecimalField(
        _("Quantity (Gallons)"), max_digits=10, decimal_places=2
    )
    quantity_lbs = models.DecimalField(
        _("Quantity (Lbs)"), max_digits=10, decimal_places=2
    )
    density = models.DecimalField(_("Density"), max_digits=6, decimal_places=4)
    progress = models.CharField(
        _("Progress"), max_length=20, choices=PROGRESS_CHOICES, default="started"
    )
    charge_flags = models.JSONField(
        _("Charge Flags"), default=dict, blank=True
    )
    assigned_at = models.DateTimeField(_("Assigned At"), null=True, blank=True)
    completed_at = models.DateTimeField(_("Completed At"), null=True, blank=True)
    qt_dispatch_id = models.CharField(
        _("QT Dispatch ID"),
        max_length=100,
        blank=True,
        null=True,
        help_text=_("QT Technologies API dispatch ID"),
    )
    qt_sync_status = models.CharField(
        _("QT Sync Status"),
        max_length=20,
        choices=SYNC_STATUS_CHOICES,
        default="pending",
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "fuel_transaction"
        verbose_name = _("Fuel Transaction")
        verbose_name_plural = _("Fuel Transactions")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Ticket {self.ticket_number} - {self.quantity_gallons} gal"


class FuelerAssignment(models.Model):
    """Junction table for fuelers assigned to transactions"""

    transaction = models.ForeignKey(
        FuelTransaction,
        on_delete=models.CASCADE,
        related_name="fueler_assignments",
        verbose_name=_("Transaction"),
    )
    fueler = models.ForeignKey(
        Fueler,
        on_delete=models.CASCADE,
        related_name="assignments",
        verbose_name=_("Fueler"),
    )
    assigned_at = models.DateTimeField(_("Assigned At"), auto_now_add=True)

    class Meta:
        db_table = "fueler_assignment"
        verbose_name = _("Fueler Assignment")
        verbose_name_plural = _("Fueler Assignments")
        unique_together = [["transaction", "fueler"]]
        ordering = ["-assigned_at"]

    def __str__(self):
        return f"{self.fueler.fueler_name} -> {self.transaction.ticket_number}"
