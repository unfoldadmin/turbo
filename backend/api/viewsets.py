from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Prefetch
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Aircraft,
    Equipment,
    Flight,
    Fueler,
    FuelerAssignment,
    FuelerTraining,
    FuelTank,
    FuelTransaction,
    LineSchedule,
    ParkingLocation,
    TankLevelReading,
    TerminalGate,
    Training,
)
from .permissions import AllowAnyReadOnly, IsAdminUser
from .serializers import (
    AircraftSerializer,
    EquipmentSerializer,
    FlightDetailSerializer,
    FlightListSerializer,
    FuelerAssignmentSerializer,
    FuelerSerializer,
    FuelerTrainingSerializer,
    FuelerWithCertificationsSerializer,
    FuelTankSerializer,
    FuelTankWithLatestReadingSerializer,
    FuelTransactionCreateSerializer,
    FuelTransactionDetailSerializer,
    FuelTransactionListSerializer,
    LineScheduleSerializer,
    ParkingLocationSerializer,
    TankLevelReadingSerializer,
    TerminalGateSerializer,
    TrainingSerializer,
    UserListSerializer,
)

User = get_user_model()


# ============================================================================
# Fuel Farm ViewSets
# ============================================================================


class FuelTankViewSet(viewsets.ModelViewSet):
    """
    ViewSet for fuel tanks.
    List action includes latest readings and status.
    """

    queryset = FuelTank.objects.all()
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["tank_id", "tank_name", "fuel_type"]
    ordering_fields = ["tank_id", "tank_name", "fuel_type"]
    ordering = ["tank_id"]

    def get_serializer_class(self):
        if self.action == "list":
            return FuelTankWithLatestReadingSerializer
        return FuelTankSerializer

    @action(detail=True, methods=["get"])
    def readings(self, request, pk=None):
        """Get historical readings for a specific tank"""
        tank = self.get_object()
        days = int(request.query_params.get("days", 7))
        start_date = date.today() - timedelta(days=days)

        readings = TankLevelReading.objects.filter(
            tank_id=tank.tank_id, recorded_at__gte=start_date
        ).order_by("-recorded_at")

        serializer = TankLevelReadingSerializer(readings, many=True)
        return Response(serializer.data)


class TankLevelReadingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for tank level readings.
    """

    queryset = TankLevelReading.objects.all().order_by("-recorded_at")
    serializer_class = TankLevelReadingSerializer
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.OrderingFilter]
    filterset_fields = ["tank_id"]
    ordering_fields = ["recorded_at", "tank_id"]
    ordering = ["-recorded_at"]


# ============================================================================
# Aircraft & Gate ViewSets
# ============================================================================


class AircraftViewSet(viewsets.ModelViewSet):
    """ViewSet for aircraft registry"""

    queryset = Aircraft.objects.all()
    serializer_class = AircraftSerializer
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["tail_number", "aircraft_type", "airline_icao"]
    ordering_fields = ["tail_number", "aircraft_type", "airline_icao"]
    ordering = ["tail_number"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return super().get_permissions()


class TerminalGateViewSet(viewsets.ModelViewSet):
    """ViewSet for terminal gates (DEPRECATED - use ParkingLocationViewSet)"""

    queryset = TerminalGate.objects.all()
    serializer_class = TerminalGateSerializer
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["terminal_num", "gate_number"]
    filterset_fields = ["terminal_num"]
    ordering_fields = ["display_order", "terminal_num", "gate_number"]
    ordering = ["display_order", "terminal_num", "gate_number"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return super().get_permissions()


class ParkingLocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing parking locations.

    list: Get all parking locations (active by default)
    retrieve: Get specific parking location
    create: Create new parking location
    update: Update parking location
    destroy: Soft delete (set display_order to 0)
    """

    queryset = ParkingLocation.objects.all()
    serializer_class = ParkingLocationSerializer
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["location_code", "description", "terminal", "gate"]
    filterset_fields = ["airport", "terminal", "gate", "display_order"]
    ordering_fields = ["display_order", "location_code", "created_at"]
    ordering = ["-display_order", "location_code"]

    def get_queryset(self):
        """Filter to active locations by default, unless ?include_inactive=true"""
        queryset = super().get_queryset()
        include_inactive = (
            self.request.query_params.get("include_inactive", "false").lower() == "true"
        )

        if not include_inactive:
            queryset = queryset.filter(display_order__gt=0)

        return queryset

    def perform_destroy(self, instance):
        """Soft delete by setting display_order to 0 instead of actual deletion"""
        instance.display_order = 0
        instance.save()

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Get only active parking locations"""
        active_locations = self.queryset.filter(display_order__gt=0)
        serializer = self.get_serializer(active_locations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_airport(self, request):
        """Group parking locations by airport"""
        airport = request.query_params.get("airport", "MSO")
        locations = self.queryset.filter(airport=airport, display_order__gt=0)
        serializer = self.get_serializer(locations, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return super().get_permissions()


# ============================================================================
# Flight ViewSet
# ============================================================================


class FlightViewSet(viewsets.ModelViewSet):
    """ViewSet for flights with filtering by status and date"""

    queryset = Flight.objects.select_related("aircraft", "location").all()
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["call_sign", "destination"]
    filterset_fields = ["flight_status", "aircraft", "location"]
    ordering_fields = ["departure_time", "arrival_time", "call_sign"]
    ordering = ["-departure_time"]

    def get_serializer_class(self):
        if self.action in ["retrieve"]:
            return FlightDetailSerializer
        return FlightListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by date range
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(departure_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(departure_time__lte=end_date)

        # Filter for today's flights
        if self.request.query_params.get("today") == "true":
            today = date.today()
            queryset = queryset.filter(departure_time__date=today) | queryset.filter(
                arrival_time__date=today
            )

        return queryset

    def update(self, request, *args, **kwargs):
        """Override to add debug logging"""
        import json

        print(f"PATCH /api/flights/{kwargs.get('pk')}/ - Request data:")
        print(json.dumps(request.data, indent=2, default=str))
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print(f"Update failed with error: {e}")
            raise

    def partial_update(self, request, *args, **kwargs):
        """Override to add debug logging"""
        import json

        print(f"PATCH /api/flights/{kwargs.get('pk')}/ - Request data:")
        print(json.dumps(request.data, indent=2, default=str))
        try:
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            print(f"Partial update failed with error: {e}")
            raise


# ============================================================================
# Fueler & Training ViewSets
# ============================================================================


class FuelerViewSet(viewsets.ModelViewSet):
    """ViewSet for fuelers"""

    queryset = Fueler.objects.select_related("user").all()
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["fueler_name", "handheld_name", "user__username"]
    filterset_fields = ["status"]
    ordering_fields = ["fueler_name", "status"]
    ordering = ["fueler_name"]

    def get_serializer_class(self):
        if self.action in ["retrieve"]:
            return FuelerWithCertificationsSerializer
        return FuelerSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == "retrieve":
            queryset = queryset.prefetch_related(
                Prefetch(
                    "certifications",
                    queryset=FuelerTraining.objects.select_related(
                        "training", "certified_by"
                    ),
                )
            )
        return queryset

    @action(detail=True, methods=["get"])
    def certifications(self, request, pk=None):
        """Get certifications for a specific fueler"""
        fueler = self.get_object()
        certifications = fueler.certifications.select_related(
            "training", "certified_by"
        )
        serializer = FuelerTrainingSerializer(certifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def expiring_soon(self, request):
        """Get fuelers with certifications expiring within 7 days"""
        days = int(request.query_params.get("days", 7))
        threshold_date = date.today() + timedelta(days=days)

        fuelers_with_expiring = Fueler.objects.filter(
            certifications__expiry_date__lte=threshold_date,
            certifications__expiry_date__gte=date.today(),
        ).distinct()

        serializer = self.get_serializer(fuelers_with_expiring, many=True)
        return Response(serializer.data)


class TrainingViewSet(viewsets.ModelViewSet):
    """ViewSet for training courses"""

    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["training_name", "aircraft_type"]
    filterset_fields = ["aircraft_type"]
    ordering_fields = ["training_name", "validity_period_days"]
    ordering = ["training_name"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return super().get_permissions()


class FuelerTrainingViewSet(viewsets.ModelViewSet):
    """ViewSet for fueler training certifications"""

    queryset = FuelerTraining.objects.select_related(
        "fueler", "training", "certified_by"
    ).all()
    serializer_class = FuelerTrainingSerializer
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.OrderingFilter]
    filterset_fields = ["fueler", "training"]
    ordering_fields = ["expiry_date", "completed_date"]
    ordering = ["-expiry_date"]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by expiry status
        status_filter = self.request.query_params.get("status")
        if status_filter == "expired":
            queryset = queryset.filter(expiry_date__lt=date.today())
        elif status_filter == "expiring_soon":
            days = int(self.request.query_params.get("days", 7))
            threshold_date = date.today() + timedelta(days=days)
            queryset = queryset.filter(
                expiry_date__lte=threshold_date, expiry_date__gte=date.today()
            )
        elif status_filter == "valid":
            queryset = queryset.filter(expiry_date__gte=date.today())

        return queryset

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAdminUser()]


# ============================================================================
# Fuel Transaction ViewSets
# ============================================================================


class FuelTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for fuel transactions with assignment management"""

    queryset = FuelTransaction.objects.select_related("flight").prefetch_related(
        "fueler_assignments__fueler"
    )
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["ticket_number", "flight__flight_number"]
    filterset_fields = ["progress", "qt_sync_status"]
    ordering_fields = ["created_at", "assigned_at", "completed_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return FuelTransactionCreateSerializer
        elif self.action == "retrieve":
            return FuelTransactionDetailSerializer
        return FuelTransactionListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by date range
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        # Filter unassigned transactions
        if self.request.query_params.get("unassigned") == "true":
            queryset = queryset.filter(fueler_assignments__isnull=True)

        return queryset

    @action(detail=True, methods=["post"])
    def assign_fueler(self, request, pk=None):
        """Assign a fueler to this transaction"""
        transaction = self.get_object()
        fueler_id = request.data.get("fueler_id")

        try:
            fueler = Fueler.objects.get(pk=fueler_id)
        except Fueler.DoesNotExist:
            return Response(
                {"error": "Fueler not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Create assignment
        assignment, created = FuelerAssignment.objects.get_or_create(
            transaction=transaction, fueler=fueler
        )

        # Update transaction assigned_at if this is first assignment
        if created and not transaction.assigned_at:
            transaction.assigned_at = assignment.assigned_at
            transaction.save(update_fields=["assigned_at"])

        serializer = FuelerAssignmentSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def remove_fueler(self, request, pk=None):
        """Remove a fueler from this transaction"""
        transaction = self.get_object()
        fueler_id = request.data.get("fueler_id")

        try:
            assignment = FuelerAssignment.objects.get(
                transaction=transaction, fueler_id=fueler_id
            )
            assignment.delete()

            # If no more assignments, clear assigned_at
            if not transaction.fueler_assignments.exists():
                transaction.assigned_at = None
                transaction.save(update_fields=["assigned_at"])

            return Response(status=status.HTTP_204_NO_CONTENT)
        except FuelerAssignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def update_progress(self, request, pk=None):
        """Update transaction progress status"""
        transaction = self.get_object()
        new_progress = request.data.get("progress")

        if new_progress not in dict(FuelTransaction.PROGRESS_CHOICES):
            return Response(
                {"error": "Invalid progress status"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        transaction.progress = new_progress
        if new_progress == "completed" and not transaction.completed_at:
            from django.utils import timezone

            transaction.completed_at = timezone.now()

        transaction.save()

        serializer = self.get_serializer(transaction)
        return Response(serializer.data)


# ============================================================================
# User Management ViewSet
# ============================================================================


class UserManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for user management (admin only)"""

    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name", "employee_id"]
    filterset_fields = ["role", "is_active", "is_active_fueler"]
    ordering_fields = ["username", "email", "date_joined"]
    ordering = ["username"]


# ============================================================================
# Equipment ViewSet
# ============================================================================


class EquipmentViewSet(viewsets.ModelViewSet):
    """ViewSet for equipment inventory"""

    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "equipment_id",
        "equipment_name",
        "equipment_type",
        "manufacturer",
        "model",
    ]
    filterset_fields = ["equipment_type", "status"]
    ordering_fields = [
        "equipment_id",
        "equipment_name",
        "status",
        "next_maintenance_date",
    ]
    ordering = ["equipment_id"]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by maintenance status
        maintenance_filter = self.request.query_params.get("maintenance_status")
        if maintenance_filter == "overdue":
            queryset = queryset.filter(next_maintenance_date__lt=date.today())
        elif maintenance_filter == "due_soon":
            threshold_date = date.today() + timedelta(days=7)
            queryset = queryset.filter(
                next_maintenance_date__lte=threshold_date,
                next_maintenance_date__gte=date.today(),
            )

        return queryset

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return super().get_permissions()


# ============================================================================
# Line Schedule ViewSet
# ============================================================================


class LineScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for line service schedules"""

    queryset = LineSchedule.objects.select_related("flight", "gate").prefetch_related(
        "assigned_personnel", "equipment_used"
    )
    serializer_class = LineScheduleSerializer
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["flight__flight_number", "service_type", "notes"]
    filterset_fields = ["service_type", "status", "gate"]
    ordering_fields = ["scheduled_time", "service_type", "status"]
    ordering = ["-scheduled_time"]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by date range
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(scheduled_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(scheduled_time__lte=end_date)

        # Filter for today's schedules
        if self.request.query_params.get("today") == "true":
            today = date.today()
            queryset = queryset.filter(scheduled_time__date=today)

        return queryset

    @action(detail=True, methods=["post"])
    def start_service(self, request, pk=None):
        """Mark service as started"""
        schedule = self.get_object()
        from django.utils import timezone

        if not schedule.actual_start_time:
            schedule.actual_start_time = timezone.now()
            schedule.status = "in_progress"
            schedule.save()

        serializer = self.get_serializer(schedule)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def complete_service(self, request, pk=None):
        """Mark service as completed"""
        schedule = self.get_object()
        from django.utils import timezone

        if not schedule.actual_end_time:
            schedule.actual_end_time = timezone.now()
            schedule.status = "completed"
            if not schedule.actual_start_time:
                schedule.actual_start_time = schedule.actual_end_time
            schedule.save()

        serializer = self.get_serializer(schedule)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return super().get_permissions()
