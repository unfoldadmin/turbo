from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from unfold.admin import ModelAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from .models import (
    Aircraft,
    Flight,
    Fueler,
    FuelerAssignment,
    FuelerTraining,
    FuelTank,
    FuelTransaction,
    ParkingLocation,
    TankLevelReading,
    TerminalGate,
    Training,
    User,
)

admin.site.unregister(Group)


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm
    list_display = ["username", "email", "role", "is_active_fueler", "is_staff"]
    list_filter = ["role", "is_active_fueler", "is_staff", "is_superuser"]
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "FBO Information",
            {
                "fields": (
                    "role",
                    "phone_number",
                    "employee_id",
                    "is_active_fueler",
                )
            },
        ),
    )


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


@admin.register(FuelTank)
class FuelTankAdmin(ModelAdmin):
    list_display = [
        "tank_id",
        "tank_name",
        "fuel_type",
        "capacity_gallons",
        "usable_min_inches",
        "usable_max_inches",
    ]
    list_filter = ["fuel_type"]
    search_fields = ["tank_id", "tank_name"]


@admin.register(TankLevelReading)
class TankLevelReadingAdmin(ModelAdmin):
    list_display = ["tank_id", "level", "recorded_at", "created_at"]
    list_filter = ["tank_id", "recorded_at"]
    search_fields = ["tank_id"]
    ordering = ["-recorded_at"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Aircraft)
class AircraftAdmin(ModelAdmin):
    list_display = [
        "tail_number",
        "aircraft_type_display",
        "aircraft_type_icao",
        "airline_icao",
        "fleet_id",
    ]
    list_filter = ["aircraft_type_icao", "airline_icao"]
    search_fields = [
        "tail_number",
        "aircraft_type_display",
        "aircraft_type_icao",
        "airline_icao",
    ]


@admin.register(TerminalGate)
class TerminalGateAdmin(ModelAdmin):
    """DEPRECATED - Use ParkingLocationAdmin instead"""

    list_display = [
        "terminal_num",
        "gate_number",
        "terminal_id",
        "location_id",
        "display_order",
    ]
    list_filter = ["terminal_num"]
    search_fields = ["terminal_num", "gate_number", "terminal_id"]
    ordering = ["display_order", "terminal_num", "gate_number"]


@admin.register(ParkingLocation)
class ParkingLocationAdmin(ModelAdmin):
    list_display = [
        "location_code",
        "description",
        "airport",
        "terminal",
        "gate",
        "display_order",
        "is_active",
    ]
    list_filter = ["airport", "terminal", "display_order"]
    search_fields = ["location_code", "description", "terminal", "gate"]
    ordering = ["-display_order", "location_code"]

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("location_code", "description", "display_order")},
        ),
        ("Location Details", {"fields": ("airport", "terminal", "gate")}),
        (
            "Geographic Data",
            {
                "fields": ("latitude", "longitude", "polygon"),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "modified_at"),
                "classes": ("collapse",),
            },
        ),
    )
    readonly_fields = ["created_at", "modified_at"]


@admin.register(Flight)
class FlightAdmin(ModelAdmin):
    list_display = [
        "call_sign",
        "aircraft",
        "location",
        "departure_time",
        "arrival_time",
        "flight_status",
        "destination",
    ]
    list_filter = ["flight_status", "departure_time"]
    search_fields = ["call_sign", "destination"]
    raw_id_fields = ["aircraft", "location"]


@admin.register(Fueler)
class FuelerAdmin(ModelAdmin):
    list_display = ["fueler_name", "user", "handheld_name", "status"]
    list_filter = ["status"]
    search_fields = ["fueler_name", "handheld_name", "user__username"]
    raw_id_fields = ["user"]


@admin.register(Training)
class TrainingAdmin(ModelAdmin):
    list_display = [
        "training_name",
        "validity_period_days",
        "aircraft_type",
        "created_at",
    ]
    list_filter = ["aircraft_type"]
    search_fields = ["training_name", "aircraft_type"]


@admin.register(FuelerTraining)
class FuelerTrainingAdmin(ModelAdmin):
    list_display = [
        "fueler",
        "training",
        "completed_date",
        "expiry_date",
        "certified_by",
    ]
    list_filter = ["expiry_date", "completed_date"]
    search_fields = ["fueler__fueler_name", "training__training_name"]
    raw_id_fields = ["fueler", "training", "certified_by"]


@admin.register(FuelTransaction)
class FuelTransactionAdmin(ModelAdmin):
    list_display = [
        "ticket_number",
        "flight",
        "quantity_gallons",
        "progress",
        "qt_sync_status",
        "created_at",
    ]
    list_filter = ["progress", "qt_sync_status", "created_at"]
    search_fields = ["ticket_number", "flight__call_sign"]
    raw_id_fields = ["flight"]


@admin.register(FuelerAssignment)
class FuelerAssignmentAdmin(ModelAdmin):
    list_display = ["transaction", "fueler", "assigned_at"]
    list_filter = ["assigned_at"]
    search_fields = ["transaction__ticket_number", "fueler__fueler_name"]
    raw_id_fields = ["transaction", "fueler"]
