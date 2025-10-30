from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Prefetch, Q
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
from .permissions import AllowAnyReadOnly, IsAdminUser
from .serializers import (
    AircraftSerializer,
    FlightDetailSerializer,
    FlightListSerializer,
    FuelTankSerializer,
    FuelTankWithLatestReadingSerializer,
    FuelTransactionCreateSerializer,
    FuelTransactionDetailSerializer,
    FuelTransactionListSerializer,
    FuelerAssignmentSerializer,
    FuelerSerializer,
    FuelerTrainingSerializer,
    FuelerWithCertificationsSerializer,
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
    """ViewSet for terminal gates"""

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


# ============================================================================
# Flight ViewSet
# ============================================================================


class FlightViewSet(viewsets.ModelViewSet):
    """ViewSet for flights with filtering by status and date"""

    queryset = Flight.objects.select_related("aircraft", "gate").all()
    permission_classes = [AllowAnyReadOnly]  # DEV: Allow unauthenticated reads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["flight_number", "destination"]
    filterset_fields = ["flight_status", "aircraft", "gate"]
    ordering_fields = ["departure_time", "arrival_time", "flight_number"]
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
            queryset = queryset.filter(
                departure_time__date=today
            ) | queryset.filter(arrival_time__date=today)

        return queryset


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
