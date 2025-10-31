from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Extended User model for FBO operations"""

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("line", "Line Department"),
        ("frontdesk", "Front Desk"),
    ]

    role = models.CharField(
        _("Role"), max_length=20, choices=ROLE_CHOICES, default="line"
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

    def get_initials(self):
        """Get user initials from first and last name"""
        if self.first_name and self.last_name:
            return f"{self.first_name[0]}{self.last_name[0]}".upper()
        elif self.first_name:
            return self.first_name[0].upper()
        elif self.username:
            return self.username[:2].upper()
        return "??"

    def get_department(self):
        """Get department name from role"""
        if self.role == "line":
            return "Line Department"
        elif self.role == "frontdesk":
            return "Front Desk"
        elif self.role == "admin":
            return "Administration"
        return "Unknown"


class FuelTank(models.Model):
    """Fuel tank configuration and metadata"""

    FUEL_TYPE_CHOICES = [
        ("jet_a", "Jet A"),
        ("avgas", "Avgas"),
    ]

    tank_id = models.CharField(_("Tank ID"), max_length=10, primary_key=True)
    tank_name = models.CharField(_("Tank Name"), max_length=100)
    fuel_type = models.CharField(
        _("Fuel Type"), max_length=10, choices=FUEL_TYPE_CHOICES
    )
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
    aircraft_type_icao = models.CharField(
        _("Aircraft Type (ICAO)"), max_length=10, blank=True, default=""
    )
    aircraft_type_display = models.CharField(
        _("Aircraft Type (Display)"), max_length=100, blank=True, default=""
    )
    airline_icao = models.CharField(_("Airline ICAO"), max_length=10, blank=True)
    fleet_id = models.CharField(_("Fleet ID"), max_length=50, blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "aircraft"
        verbose_name = _("Aircraft")
        verbose_name_plural = _("Aircraft")

    def __str__(self):
        return f"{self.tail_number} ({self.aircraft_type_display})"


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


class ParkingLocation(models.Model):
    """
    Represents a physical parking location for aircraft.
    Supports terminals, hangars, ramps, tie-downs with optional map coordinates.
    """

    # Validator for location_code format
    location_code_validator = RegexValidator(
        regex=r"^[A-Z0-9\-]+$",
        message="Location code must be uppercase alphanumeric with hyphens only (no spaces)",
        code="invalid_location_code",
    )

    # Primary identifier - REQUIRED
    location_code = models.CharField(
        _("Location Code"),
        max_length=50,
        unique=True,
        validators=[location_code_validator],
        help_text="Unique code: CAPS, alphanumeric, hyphens only. Examples: T-A1, D-1, BRETZ",
    )

    # Description
    description = models.TextField(_("Description"), blank=True, default="")

    # Coordinates for map placement
    latitude = models.DecimalField(
        _("Latitude"),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Latitude coordinate for map display",
    )
    longitude = models.DecimalField(
        _("Longitude"),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Longitude coordinate for map display",
    )

    # Optional polygon for hangars (store as JSON)
    # Format: [[lat1, lon1], [lat2, lon2], ...]
    polygon = models.JSONField(
        _("Polygon"),
        null=True,
        blank=True,
        help_text="Array of [lat, lon] coordinates defining hangar boundaries",
    )

    # Airport code
    airport = models.CharField(
        _("Airport"),
        max_length=10,
        default="MSO",
        help_text="Airport code: MSO, USFS, etc.",
    )

    # Optional terminal
    terminal = models.CharField(
        _("Terminal"),
        max_length=50,
        blank=True,
        null=True,
        help_text="Terminal identifier: T, MIN, MAINT, etc.",
    )

    # Optional gate
    gate = models.CharField(
        _("Gate"),
        max_length=10,
        blank=True,
        null=True,
        help_text="Gate number: A1, A2, B1, B2, etc.",
    )

    # Display order (0 = inactive, higher = more popular)
    display_order = models.IntegerField(
        _("Display Order"),
        default=0,
        help_text="0 = inactive/hidden, higher numbers = more popular (shows first in lists)",
    )

    # Timestamps
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "parking_location"
        verbose_name = _("Parking Location")
        verbose_name_plural = _("Parking Locations")
        ordering = ["-display_order", "location_code"]
        indexes = [
            models.Index(fields=["airport", "display_order"]),
            models.Index(fields=["location_code"]),
        ]

    def __str__(self):
        if self.description:
            return f"{self.location_code} - {self.description}"
        return self.location_code

    @property
    def is_active(self):
        """Returns True if location is active (display_order > 0)"""
        return self.display_order > 0


class Flight(models.Model):
    """Flight information and tracking"""

    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("arrived", "Arrived"),
        ("departed", "Departed"),
        ("cancelled", "Cancelled"),
        ("delayed", "Delayed"),
        ("planned", "Planned"),
    ]

    SOURCE_CHOICES = [
        ("qt", "QuickTurn"),
        ("front-desk", "Front Desk"),
        ("line-department", "Line Department"),
        ("google-calendar", "Google Calendar"),
    ]

    # Fields in database column order
    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.RESTRICT,
        related_name="flights",
        verbose_name=_("Aircraft"),
        db_column="aircraft_id",
    )
    call_sign = models.CharField(
        _("Call Sign / Flight Number"), max_length=20, null=True, blank=True
    )
    arrival_time = models.DateTimeField(_("Arrival Time"), null=True, blank=True)
    departure_time = models.DateTimeField(_("Departure Time"))
    flight_status = models.CharField(
        _("Flight Status"), max_length=20, choices=STATUS_CHOICES, default="scheduled"
    )
    origin = models.CharField(_("Origin"), max_length=100, blank=True)
    destination = models.CharField(_("Destination"), max_length=100)
    contact_name = models.CharField(_("Contact Name"), max_length=255, blank=True)
    contact_notes = models.TextField(_("Contact Notes"), blank=True)
    services = models.JSONField(_("Services"), default=list, blank=True)
    fuel_order_notes = models.TextField(_("Fuel Order Notes"), blank=True)
    passenger_count = models.IntegerField(_("Passenger Count"), null=True, blank=True)
    notes = models.TextField(_("Notes"), blank=True)
    location = models.ForeignKey(
        ParkingLocation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="flights",
        verbose_name=_("Parking Location"),
        db_column="location_id",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.RESTRICT,
        default=1,
        related_name="created_flights",
        verbose_name=_("Created By"),
        db_column="created_by_id",
    )
    created_by_source = models.CharField(
        _("Created By Source"),
        max_length=20,
        choices=SOURCE_CHOICES,
        default="line-department",
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "flight"
        verbose_name = _("Flight")
        verbose_name_plural = _("Flights")
        ordering = ["-departure_time"]

    def __str__(self):
        display = self.call_sign or self.aircraft.tail_number
        return f"{display} - {self.departure_time}"


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
        _("Handheld Name"),
        max_length=50,
        blank=True,
        help_text=_("Name used on handheld devices"),
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
    charge_flags = models.JSONField(_("Charge Flags"), default=dict, blank=True)
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


class Equipment(models.Model):
    """Ground support equipment inventory"""

    STATUS_CHOICES = [
        ("available", "Available"),
        ("in_use", "In Use"),
        ("maintenance", "Maintenance"),
        ("out_of_service", "Out of Service"),
    ]

    EQUIPMENT_TYPE_CHOICES = [
        ("fuel_truck", "Fuel Truck"),
        ("tug", "Tug"),
        ("gpu", "Ground Power Unit"),
        ("air_start", "Air Start Unit"),
        ("belt_loader", "Belt Loader"),
        ("stairs", "Passenger Stairs"),
        ("lavatory_service", "Lavatory Service"),
        ("water_service", "Water Service"),
        ("other", "Other"),
    ]

    equipment_id = models.CharField(_("Equipment ID"), max_length=50, unique=True)
    equipment_name = models.CharField(_("Equipment Name"), max_length=200)
    equipment_type = models.CharField(
        _("Equipment Type"), max_length=50, choices=EQUIPMENT_TYPE_CHOICES
    )
    manufacturer = models.CharField(_("Manufacturer"), max_length=100, blank=True)
    model = models.CharField(_("Model"), max_length=100, blank=True)
    serial_number = models.CharField(_("Serial Number"), max_length=100, blank=True)
    status = models.CharField(
        _("Status"), max_length=20, choices=STATUS_CHOICES, default="available"
    )
    location = models.CharField(_("Location"), max_length=200, blank=True)
    notes = models.TextField(_("Notes"), blank=True)
    last_maintenance_date = models.DateField(
        _("Last Maintenance Date"), null=True, blank=True
    )
    next_maintenance_date = models.DateField(
        _("Next Maintenance Date"), null=True, blank=True
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "equipment"
        verbose_name = _("Equipment")
        verbose_name_plural = _("Equipment")
        ordering = ["equipment_id"]

    def __str__(self):
        return f"{self.equipment_id} - {self.equipment_name}"


class LineSchedule(models.Model):
    """Line service schedule and assignments"""

    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    SERVICE_TYPE_CHOICES = [
        ("arrival_service", "Arrival Service"),
        ("departure_service", "Departure Service"),
        ("turnaround", "Turnaround Service"),
        ("overnight", "Overnight Service"),
    ]

    flight = models.ForeignKey(
        Flight,
        on_delete=models.CASCADE,
        related_name="line_schedules",
        verbose_name=_("Flight"),
        null=True,
        blank=True,
    )
    service_type = models.CharField(
        _("Service Type"), max_length=50, choices=SERVICE_TYPE_CHOICES
    )
    scheduled_time = models.DateTimeField(_("Scheduled Time"))
    actual_start_time = models.DateTimeField(
        _("Actual Start Time"), null=True, blank=True
    )
    actual_end_time = models.DateTimeField(_("Actual End Time"), null=True, blank=True)
    status = models.CharField(
        _("Status"), max_length=20, choices=STATUS_CHOICES, default="scheduled"
    )
    assigned_personnel = models.ManyToManyField(
        User,
        related_name="line_schedule_assignments",
        verbose_name=_("Assigned Personnel"),
        blank=True,
    )
    equipment_used = models.ManyToManyField(
        Equipment,
        related_name="line_schedules",
        verbose_name=_("Equipment Used"),
        blank=True,
    )
    gate = models.ForeignKey(
        TerminalGate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="line_schedules",
        verbose_name=_("Gate"),
    )
    notes = models.TextField(_("Notes"), blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    modified_at = models.DateTimeField(_("Modified At"), auto_now=True)

    class Meta:
        db_table = "line_schedule"
        verbose_name = _("Line Schedule")
        verbose_name_plural = _("Line Schedules")
        ordering = ["-scheduled_time"]

    def __str__(self):
        flight_info = f" - {self.flight.flight_number}" if self.flight else ""
        return f"{self.service_type} @ {self.scheduled_time}{flight_info}"
