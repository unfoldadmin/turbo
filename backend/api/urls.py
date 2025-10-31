from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .api import UserViewSet
from .viewsets import (
    AircraftViewSet,
    EquipmentViewSet,
    FlightViewSet,
    FuelerTrainingViewSet,
    FuelerViewSet,
    FuelTankViewSet,
    FuelTransactionViewSet,
    LineScheduleViewSet,
    ParkingLocationViewSet,
    TankLevelReadingViewSet,
    TerminalGateViewSet,
    TrainingViewSet,
    UserManagementViewSet,
)

# API Router
router = routers.DefaultRouter()

# Authentication & User Management
router.register("users", UserViewSet, basename="users")
router.register("admin/users", UserManagementViewSet, basename="admin-users")

# Fuel Farm
router.register("tanks", FuelTankViewSet, basename="tanks")
router.register("tank-readings", TankLevelReadingViewSet, basename="tank-readings")

# Flights & Parking
router.register("flights", FlightViewSet, basename="flights")
router.register("aircraft", AircraftViewSet, basename="aircraft")
router.register(
    "parking-locations", ParkingLocationViewSet, basename="parking-locations"
)
router.register("gates", TerminalGateViewSet, basename="gates")  # DEPRECATED

# Fuel Dispatch
router.register("transactions", FuelTransactionViewSet, basename="transactions")

# Training Management
router.register("fuelers", FuelerViewSet, basename="fuelers")
router.register("trainings", TrainingViewSet, basename="trainings")
router.register(
    "fueler-certifications", FuelerTrainingViewSet, basename="fueler-certifications"
)

# Equipment & Line Schedule
router.register("equipment", EquipmentViewSet, basename="equipment")
router.register("line-schedules", LineScheduleViewSet, basename="line-schedules")

urlpatterns = [
    # API Documentation
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
    ),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Authentication
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # API Routes
    path("api/", include(router.urls)),
    # Admin
    path("admin/", admin.site.urls),
    # Root redirect to Swagger UI
    path("", RedirectView.as_view(url="/api/schema/swagger-ui/", permanent=False)),
]
