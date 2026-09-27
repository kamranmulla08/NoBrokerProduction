from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import InterestRequest, Property


class PropertyAndInterestApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()

        def create_test_user(email, name, phone, role):
            user = user_model(
                email=email,
                name=name,
                phone=phone,
                role=role,
            )
            user.set_password("secure-password-123")
            user.save()
            return user

        self.owner = create_test_user(
            "owner@example.com",
            "Owner",
            "9000000001",
            "OWNER",
        )
        self.buyer = create_test_user(
            "buyer@example.com",
            "Buyer",
            "9000000002",
            "BUYER",
        )
        self.other_owner = create_test_user(
            "other-owner@example.com",
            "Other Owner",
            "9000000003",
            "OWNER",
        )
        self.property = Property.objects.create(
            owner=self.owner,
            title="Two bedroom flat",
            description="Well-lit flat",
            property_type="FLAT",
            listing_type="RENT",
            price="25000.00",
            bedrooms=2,
            bathrooms=2,
            area=900,
            city="Pune",
            address="Baner, Pune",
        )

    def test_only_owners_can_create_properties(self):
        payload = {
            "title": "New flat", "description": "Description",
            "property_type": "FLAT", "listing_type": "SALE",
            "price": "5000000.00", "bedrooms": 2, "bathrooms": 2,
            "area": 1000, "city": "Pune", "address": "Pune",
        }
        self.client.force_authenticate(self.buyer)
        response = self.client.post("/api/properties/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.owner)
        response = self.client.post("/api/properties/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["owner"], self.owner.id)

    def test_property_updates_require_ownership(self):
        self.client.force_authenticate(self.other_owner)
        response = self.client.patch(
            f"/api/properties/{self.property.id}/",
            {"title": "Unauthorized edit"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.property.refresh_from_db()
        self.assertEqual(self.property.title, "Two bedroom flat")

    def test_interest_lifecycle_and_duplicate_protection(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post(
            f"/api/properties/{self.property.id}/interest/", {}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        interest_id = response.data["id"]

        duplicate = self.client.post(
            f"/api/properties/{self.property.id}/interest/", {}, format="json"
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

        self.client.force_authenticate(self.owner)
        update = self.client.patch(
            f"/api/properties/interests/{interest_id}/",
            {"status": "ACCEPTED"},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertEqual(update.data["status"], InterestRequest.Status.ACCEPTED)

        self.client.force_authenticate(self.buyer)
        mine = self.client.get("/api/properties/interests/mine/")
        self.assertEqual(mine.status_code, status.HTTP_200_OK)
        self.assertEqual(mine.data[0]["status"], InterestRequest.Status.ACCEPTED)

    def test_unavailable_properties_reject_new_interests(self):
        self.client.force_authenticate(self.buyer)

        for availability_status in [
            Property.AvailabilityStatus.SOLD,
            Property.AvailabilityStatus.RENTED,
        ]:
            with self.subTest(availability_status=availability_status):
                self.property.availability_status = availability_status
                self.property.save(update_fields=["availability_status"])

                response = self.client.post(
                    f"/api/properties/{self.property.id}/interest/",
                    {},
                    format="json",
                )

                self.assertEqual(
                    response.status_code,
                    status.HTTP_400_BAD_REQUEST,
                )
                self.assertFalse(
                    InterestRequest.objects.filter(
                        property=self.property,
                        buyer=self.buyer,
                    ).exists()
                )

    def test_search_combines_filters_with_price_sorting(self):
        Property.objects.create(
            owner=self.owner,
            title="Five bedroom sale home",
            description="Large home",
            property_type="HOUSE",
            listing_type="SALE",
            price="5000000.00",
            bedrooms=5,
            bathrooms=3,
            area=2400,
            city="Pune",
            address="Wakad, Pune",
        )

        response = self.client.get(
            "/api/properties/",
            {
                "city": "Pune",
                "listing_type": "SALE",
                "bedrooms": "5+",
                "sort": "price_high_to_low",
                "page": 1,
                "page_size": 9,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["title"], "Five bedroom sale home")
        self.assertEqual(response.data["results"][0]["bedrooms"], 5)
