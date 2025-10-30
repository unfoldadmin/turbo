from datetime import date

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions, serializers

from .models import (
    Aircraft,
    Flight,
    FuelTank,
    FuelTransaction,
    Fueler,
    FuelerAssignment,
    FuelerTraining,
    TankLevelReading,
    TerminalGate,
    Training,
)

User = get_user_model()


# ============================================================================
# User Serializers
# ============================================================================


class UserCurrentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "employee_id",
            "is_active_fueler",
        ]
        read_only_fields = ["id"]


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users (admin view)"""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active_fueler",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]


class UserCurrentErrorSerializer(serializers.Serializer):
    username = serializers.ListSerializer(child=serializers.CharField(), required=False)
    first_name = serializers.ListSerializer(
        child=serializers.CharField(), required=False
    )
    last_name = serializers.ListSerializer(
        child=serializers.CharField(), required=False
    )


class UserChangePasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(style={"input_type": "password"}, write_only=True)
    password_new = serializers.CharField(style={"input_type": "password"})
    password_retype = serializers.CharField(
        style={"input_type": "password"}, write_only=True
    )

    default_error_messages = {
        "password_mismatch": _("Current password is not matching"),
        "password_invalid": _("Password does not meet all requirements"),
        "password_same": _("Both new and current passwords are same"),
    }

    class Meta:
        model = User
        fields = ["password", "password_new", "password_retype"]

    def validate(self, attrs):
        request = self.context.get("request", None)

        if not request.user.check_password(attrs["password"]):
            raise serializers.ValidationError(
                {"password": self.default_error_messages["password_mismatch"]}
            )

        try:
            validate_password(attrs["password_new"])
        except ValidationError as e:
            raise exceptions.ValidationError({"password_new": list(e.messages)}) from e

        if attrs["password_new"] != attrs["password_retype"]:
            raise serializers.ValidationError(
                {"password_retype": self.default_error_messages["password_invalid"]}
            )

        if attrs["password_new"] == attrs["password"]:
            raise serializers.ValidationError(
                {"password_new": self.default_error_messages["password_same"]}
            )
        return super().validate(attrs)


class UserChangePasswordErrorSerializer(serializers.Serializer):
    password = serializers.ListSerializer(child=serializers.CharField(), required=False)
    password_new = serializers.ListSerializer(
        child=serializers.CharField(), required=False
    )
    password_retype = serializers.ListSerializer(
        child=serializers.CharField(), required=False
    )


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(style={"input_type": "password"}, write_only=True)
    password_retype = serializers.CharField(
        style={"input_type": "password"}, write_only=True
    )

    default_error_messages = {
        "password_mismatch": _("Password are not matching."),
        "password_invalid": _("Password does not meet all requirements."),
    }

    class Meta:
        model = User
        fields = ["username", "password", "password_retype"]

    def validate(self, attrs):
        password_retype = attrs.pop("password_retype")

        try:
            validate_password(attrs.get("password"))
        except exceptions.ValidationError:
            self.fail("password_invalid")

        if attrs["password"] == password_retype:
            return attrs

        return self.fail("password_mismatch")

    def create(self, validated_data):
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)

            # By default newly registered accounts are inactive.
            user.is_active = False
            user.save(update_fields=["is_active"])

        return user


class UserCreateErrorSerializer(serializers.Serializer):
    username = serializers.ListSerializer(child=serializers.CharField(), required=False)
    password = serializers.ListSerializer(child=serializers.CharField(), required=False)
    password_retype = serializers.ListSerializer(
        child=serializers.CharField(), required=False
    )


# ============================================================================
# Fuel Tank Serializers
# ============================================================================


class FuelTankSerializer(serializers.ModelSerializer):
    """Serializer for fuel tank configuration"""

    class Meta:
        model = FuelTank
        fields = [
            "tank_id",
            "tank_name",
            "fuel_type",
            "capacity_gallons",
            "min_level_inches",
            "max_level_inches",
            "usable_min_inches",
            "usable_max_inches",
            "created_at",
            "modified_at",
        ]
        read_only_fields = ["created_at", "modified_at"]


class TankLevelReadingSerializer(serializers.ModelSerializer):
    """Serializer for tank level readings (read-only)"""

    class Meta:
        model = TankLevelReading
        fields = ["id", "tank_id", "level", "recorded_at", "created_at"]
        read_only_fields = ["id", "tank_id", "level", "recorded_at", "created_at"]


class FuelTankWithLatestReadingSerializer(serializers.ModelSerializer):
    """Serializer for fuel tank with latest reading and calculated percentage"""

    latest_reading = serializers.SerializerMethodField()
    current_level_percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = FuelTank
        fields = [
            "tank_id",
            "tank_name",
            "fuel_type",
            "capacity_gallons",
            "usable_min_inches",
            "usable_max_inches",
            "latest_reading",
            "current_level_percentage",
            "status",
        ]

    def get_latest_reading(self, obj):
        reading = (
            TankLevelReading.objects.filter(tank_id=obj.tank_id)
            .order_by("-recorded_at")
            .first()
        )
        if reading:
            return {
                "level": float(reading.level),
                "recorded_at": reading.recorded_at,
            }
        return None

    def get_current_level_percentage(self, obj):
        reading = (
            TankLevelReading.objects.filter(tank_id=obj.tank_id)
            .order_by("-recorded_at")
            .first()
        )
        if reading and obj.usable_max_inches > obj.usable_min_inches:
            usable_range = obj.usable_max_inches - obj.usable_min_inches
            current_level = reading.level - obj.usable_min_inches
            percentage = (current_level / usable_range) * 100
            return round(max(0, min(100, percentage)), 2)
        return None

    def get_status(self, obj):
        """Return red/yellow/green status based on level"""
        reading = (
            TankLevelReading.objects.filter(tank_id=obj.tank_id)
            .order_by("-recorded_at")
            .first()
        )
        if not reading:
            return "unknown"

        if reading.level < obj.usable_min_inches:
            return "critical"

        percentage = self.get_current_level_percentage(obj)
        if percentage is None:
            return "unknown"

        if percentage < 50:
            return "warning"
        return "good"


# ============================================================================
# Aircraft & Gate Serializers
# ============================================================================


class AircraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aircraft
        fields = [
            "tail_number",
            "aircraft_type",
            "airline_icao",
            "fleet_id",
            "created_at",
            "modified_at",
        ]
        read_only_fields = ["created_at", "modified_at"]


class TerminalGateSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = TerminalGate
        fields = [
            "id",
            "terminal_id",
            "terminal_num",
            "gate_number",
            "location_id",
            "display_order",
            "display_name",
            "created_at",
            "modified_at",
        ]
        read_only_fields = ["id", "created_at", "modified_at", "display_name"]

    def get_display_name(self, obj):
        return f"Terminal {obj.terminal_num} - Gate {obj.gate_number}"


# ============================================================================
# Flight Serializers
# ============================================================================


class FlightListSerializer(serializers.ModelSerializer):
    """Serializer for flight list view with nested data"""

    aircraft_display = serializers.CharField(source="aircraft.tail_number", read_only=True)
    gate_display = serializers.SerializerMethodField()

    class Meta:
        model = Flight
        fields = [
            "id",
            "flight_number",
            "aircraft",
            "aircraft_display",
            "gate",
            "gate_display",
            "arrival_time",
            "departure_time",
            "flight_status",
            "destination",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "aircraft_display", "gate_display"]

    def get_gate_display(self, obj):
        if obj.gate:
            return f"T{obj.gate.terminal_num}-G{obj.gate.gate_number}"
        return None


class FlightDetailSerializer(serializers.ModelSerializer):
    """Detailed flight serializer with full nested objects"""

    aircraft_details = AircraftSerializer(source="aircraft", read_only=True)
    gate_details = TerminalGateSerializer(source="gate", read_only=True)
    fuel_transactions_count = serializers.SerializerMethodField()

    class Meta:
        model = Flight
        fields = [
            "id",
            "flight_number",
            "aircraft",
            "aircraft_details",
            "gate",
            "gate_details",
            "arrival_time",
            "departure_time",
            "flight_status",
            "destination",
            "fuel_transactions_count",
            "created_at",
            "modified_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "modified_at",
            "aircraft_details",
            "gate_details",
            "fuel_transactions_count",
        ]

    def get_fuel_transactions_count(self, obj):
        return obj.fuel_transactions.count()


# ============================================================================
# Fueler & Training Serializers
# ============================================================================


class FuelerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Fueler
        fields = [
            "id",
            "user",
            "username",
            "email",
            "fueler_name",
            "handheld_name",
            "status",
            "created_at",
            "modified_at",
        ]
        read_only_fields = ["id", "created_at", "modified_at", "username", "email"]


class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = [
            "id",
            "training_name",
            "description",
            "validity_period_days",
            "aircraft_type",
            "created_at",
            "modified_at",
        ]
        read_only_fields = ["id", "created_at", "modified_at"]


class FuelerTrainingSerializer(serializers.ModelSerializer):
    """Fueler training certification with expiry warnings"""

    fueler_name = serializers.CharField(source="fueler.fueler_name", read_only=True)
    training_name = serializers.CharField(source="training.training_name", read_only=True)
    certified_by_name = serializers.CharField(
        source="certified_by.get_full_name", read_only=True
    )
    days_until_expiry = serializers.SerializerMethodField()
    expiry_status = serializers.SerializerMethodField()

    class Meta:
        model = FuelerTraining
        fields = [
            "id",
            "fueler",
            "fueler_name",
            "training",
            "training_name",
            "completed_date",
            "expiry_date",
            "certified_by",
            "certified_by_name",
            "days_until_expiry",
            "expiry_status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "fueler_name",
            "training_name",
            "certified_by_name",
            "days_until_expiry",
            "expiry_status",
        ]

    def get_days_until_expiry(self, obj):
        if obj.expiry_date:
            delta = obj.expiry_date - date.today()
            return delta.days
        return None

    def get_expiry_status(self, obj):
        """Return status: expired, critical (1 day), warning (3 days), caution (7 days), valid"""
        days = self.get_days_until_expiry(obj)
        if days is None:
            return "unknown"
        if days < 0:
            return "expired"
        if days <= 1:
            return "critical"
        if days <= 3:
            return "warning"
        if days <= 7:
            return "caution"
        return "valid"


class FuelerWithCertificationsSerializer(serializers.ModelSerializer):
    """Fueler with all certifications for detail view"""

    certifications = FuelerTrainingSerializer(many=True, read_only=True)
    user_details = UserListSerializer(source="user", read_only=True)
    expired_certifications_count = serializers.SerializerMethodField()

    class Meta:
        model = Fueler
        fields = [
            "id",
            "user",
            "user_details",
            "fueler_name",
            "handheld_name",
            "status",
            "certifications",
            "expired_certifications_count",
            "created_at",
            "modified_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "modified_at",
            "user_details",
            "expired_certifications_count",
        ]

    def get_expired_certifications_count(self, obj):
        return obj.certifications.filter(expiry_date__lt=date.today()).count()


# ============================================================================
# Fuel Transaction & Assignment Serializers
# ============================================================================


class FuelerAssignmentSerializer(serializers.ModelSerializer):
    fueler_name = serializers.CharField(source="fueler.fueler_name", read_only=True)

    class Meta:
        model = FuelerAssignment
        fields = ["id", "fueler", "fueler_name", "assigned_at"]
        read_only_fields = ["id", "assigned_at", "fueler_name"]


class FuelTransactionListSerializer(serializers.ModelSerializer):
    """List view for fuel transactions"""

    flight_number = serializers.CharField(source="flight.flight_number", read_only=True)
    assigned_fuelers = serializers.SerializerMethodField()

    class Meta:
        model = FuelTransaction
        fields = [
            "id",
            "ticket_number",
            "flight",
            "flight_number",
            "quantity_gallons",
            "quantity_lbs",
            "progress",
            "assigned_fuelers",
            "qt_sync_status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "flight_number", "assigned_fuelers"]

    def get_assigned_fuelers(self, obj):
        return [
            assignment.fueler.fueler_name
            for assignment in obj.fueler_assignments.select_related("fueler")
        ]


class FuelTransactionDetailSerializer(serializers.ModelSerializer):
    """Detailed view for fuel transactions"""

    flight_details = FlightListSerializer(source="flight", read_only=True)
    fueler_assignments = FuelerAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = FuelTransaction
        fields = [
            "id",
            "ticket_number",
            "flight",
            "flight_details",
            "quantity_gallons",
            "quantity_lbs",
            "density",
            "progress",
            "charge_flags",
            "assigned_at",
            "completed_at",
            "qt_dispatch_id",
            "qt_sync_status",
            "fueler_assignments",
            "created_at",
            "modified_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "modified_at",
            "flight_details",
            "fueler_assignments",
        ]


class FuelTransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating fuel transactions"""

    class Meta:
        model = FuelTransaction
        fields = [
            "ticket_number",
            "flight",
            "quantity_gallons",
            "quantity_lbs",
            "density",
            "charge_flags",
        ]

    def create(self, validated_data):
        validated_data["progress"] = "started"
        return super().create(validated_data)
