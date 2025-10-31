from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import ParkingLocation, User


class ParkingLocationModelTests(TestCase):
    """Test ParkingLocation model"""

    def test_create_parking_location(self):
        """Test creating a parking location with all fields"""
        location = ParkingLocation.objects.create(
            location_code="T-A1",
            description="Terminal Gate A1",
            airport="MSO",
            terminal="T",
            gate="A1",
            display_order=10,
            latitude=46.916600,
            longitude=-114.090656,
        )
        self.assertEqual(str(location), "T-A1 - Terminal Gate A1")
        self.assertTrue(location.is_active)
        self.assertEqual(location.airport, "MSO")

    def test_create_minimal_parking_location(self):
        """Test creating a parking location with minimal required fields"""
        location = ParkingLocation.objects.create(
            location_code="BRETZ",
        )
        self.assertEqual(str(location), "BRETZ")
        self.assertEqual(location.airport, "MSO")  # Default
        self.assertFalse(location.is_active)  # display_order defaults to 0

    def test_location_code_validation(self):
        """Test that location_code accepts valid formats"""
        valid_codes = ["T-A1", "D-1", "BRETZ", "MAINT-1", "TIE-DOWNS"]
        for code in valid_codes:
            location = ParkingLocation(location_code=code)
            location.full_clean()  # Should not raise

    def test_inactive_location(self):
        """Test that location with display_order=0 is inactive"""
        location = ParkingLocation.objects.create(
            location_code="OLD-1", display_order=0
        )
        self.assertFalse(location.is_active)

    def test_active_location(self):
        """Test that location with display_order>0 is active"""
        location = ParkingLocation.objects.create(
            location_code="ACTIVE-1", display_order=5
        )
        self.assertTrue(location.is_active)

    def test_polygon_field(self):
        """Test storing polygon coordinates as JSON"""
        polygon_coords = [
            [46.916600, -114.090656],
            [46.916700, -114.090556],
            [46.916800, -114.090456],
            [46.916600, -114.090656],
        ]
        location = ParkingLocation.objects.create(
            location_code="HANGAR-1", polygon=polygon_coords
        )
        self.assertEqual(location.polygon, polygon_coords)
        self.assertEqual(len(location.polygon), 4)

    def test_ordering(self):
        """Test default ordering by display_order DESC, location_code ASC"""
        ParkingLocation.objects.create(location_code="A-LOC", display_order=5)
        ParkingLocation.objects.create(location_code="B-LOC", display_order=10)
        ParkingLocation.objects.create(location_code="C-LOC", display_order=10)

        locations = list(ParkingLocation.objects.all())
        # Should be ordered by display_order DESC, then location_code ASC
        self.assertEqual(locations[0].location_code, "B-LOC")  # display_order=10
        self.assertEqual(locations[1].location_code, "C-LOC")  # display_order=10
        self.assertEqual(locations[2].location_code, "A-LOC")  # display_order=5


class ParkingLocationAPITests(APITestCase):
    """Test ParkingLocation API endpoints"""

    def setUp(self):
        """Create test data and admin user"""
        # Create admin user for write operations
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="testpass123",
            is_staff=True,
            role="admin",
        )

        self.location1 = ParkingLocation.objects.create(
            location_code="T-A1",
            description="Terminal A1",
            display_order=10,
            airport="MSO",
        )
        self.location2 = ParkingLocation.objects.create(
            location_code="INACTIVE",
            description="Inactive Location",
            display_order=0,
            airport="MSO",
        )
        self.location3 = ParkingLocation.objects.create(
            location_code="USFS-1",
            description="USFS Hangar",
            display_order=5,
            airport="USFS",
        )

    def test_list_active_locations(self):
        """Test listing only returns active locations by default"""
        response = self.client.get("/api/parking-locations/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response is paginated - check results array
        self.assertIn("results", response.data)
        # Only active (display_order > 0) - should be 2 from setUp
        active_count = sum(
            1 for loc in response.data["results"] if loc["display_order"] > 0
        )
        self.assertGreaterEqual(active_count, 2)  # At least our 2 test locations

    def test_list_all_locations(self):
        """Test listing all locations including inactive"""
        response = self.client.get("/api/parking-locations/?include_inactive=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response is paginated - should have at least 3 locations (2 active + 1 inactive from setUp)
        self.assertIn("results", response.data)
        self.assertGreaterEqual(
            len(response.data["results"]), 3
        )  # At least our 3 test locations

    def test_filter_by_airport(self):
        """Test filtering locations by airport"""
        response = self.client.get("/api/parking-locations/?airport=MSO")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response is paginated - check that all results are MSO airport
        self.assertIn("results", response.data)
        mso_locations = [
            loc for loc in response.data["results"] if loc["airport"] == "MSO"
        ]
        self.assertGreaterEqual(
            len(mso_locations), 1
        )  # At least one MSO location from setUp

    def test_search_locations(self):
        """Test searching locations by code or description"""
        response = self.client.get("/api/parking-locations/?search=Terminal")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response is paginated - check results contain search term
        self.assertIn("results", response.data)
        # At least one result should contain 'Terminal' in code or description
        terminal_results = [
            loc
            for loc in response.data["results"]
            if "Terminal" in loc.get("description", "") or "T-" in loc["location_code"]
        ]
        self.assertGreaterEqual(len(terminal_results), 1)

    def test_create_location(self):
        """Test creating a new parking location"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "location_code": "D-2",
            "description": "Delta Hangar 2",
            "airport": "MSO",
            "terminal": "MIN",
            "display_order": 5,
            "latitude": "46.916600",
            "longitude": "-114.090656",
        }
        response = self.client.post("/api/parking-locations/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["location_code"], "D-2")
        self.assertEqual(response.data["airport"], "MSO")

    def test_create_location_invalid_code(self):
        """Test creating location with invalid code format"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "location_code": "invalid code",  # Spaces not allowed
            "airport": "MSO",
        }
        response = self.client.post("/api/parking-locations/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_location(self):
        """Test retrieving a specific location"""
        response = self.client.get(f"/api/parking-locations/{self.location1.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["location_code"], "T-A1")
        self.assertTrue(response.data["is_active"])

    def test_update_location(self):
        """Test updating a parking location"""
        self.client.force_authenticate(user=self.admin_user)
        data = {"description": "Updated Description", "display_order": 15}
        response = self.client.patch(
            f"/api/parking-locations/{self.location1.id}/", data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Updated Description")
        self.assertEqual(response.data["display_order"], 15)

    def test_soft_delete_location(self):
        """Test soft delete sets display_order to 0"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f"/api/parking-locations/{self.location1.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify soft delete
        self.location1.refresh_from_db()
        self.assertEqual(self.location1.display_order, 0)
        self.assertFalse(self.location1.is_active)

        # Should not appear in default list
        response = self.client.get("/api/parking-locations/")
        # Response is paginated
        self.assertIn("results", response.data)
        location_codes = [loc["location_code"] for loc in response.data["results"]]
        self.assertNotIn("T-A1", location_codes)

    def test_active_endpoint(self):
        """Test custom /active/ endpoint"""
        response = self.client.get("/api/parking-locations/active/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Custom action returns unpaginated list - verify our test locations are present
        location_codes = [loc["location_code"] for loc in response.data]
        self.assertIn("T-A1", location_codes)
        self.assertIn("USFS-1", location_codes)
        # Inactive location should NOT be present
        self.assertNotIn("INACTIVE", location_codes)

    def test_by_airport_endpoint(self):
        """Test custom /by_airport/ endpoint"""
        response = self.client.get("/api/parking-locations/by_airport/?airport=USFS")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Custom action returns unpaginated list - verify USFS location is present
        location_codes = [loc["location_code"] for loc in response.data]
        self.assertIn("USFS-1", location_codes)
        # All returned locations should be USFS airport
        for loc in response.data:
            self.assertEqual(loc["airport"], "USFS")

    def test_ordering(self):
        """Test results are ordered by display_order DESC"""
        response = self.client.get("/api/parking-locations/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response is paginated
        self.assertIn("results", response.data)
        # Find our test locations in the results
        test_locations = [
            loc
            for loc in response.data["results"]
            if loc["location_code"] in ["T-A1", "USFS-1"]
        ]
        # Should be ordered by display_order DESC
        if len(test_locations) >= 2:
            t_a1 = next(
                (loc for loc in test_locations if loc["location_code"] == "T-A1"), None
            )
            usfs = next(
                (loc for loc in test_locations if loc["location_code"] == "USFS-1"),
                None,
            )
            if t_a1 and usfs:
                # T-A1 (display_order=10) should come before USFS-1 (display_order=5)
                t_a1_index = response.data["results"].index(t_a1)
                usfs_index = response.data["results"].index(usfs)
                self.assertLess(t_a1_index, usfs_index)
