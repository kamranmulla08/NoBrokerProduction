from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.properties.models import InterestRequest, Property


class DealApiTests(APITestCase):
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
            "deal-owner@example.com",
            "Deal Owner",
            "9000000011",
            "OWNER",
        )
        self.buyer = create_test_user(
            "deal-buyer@example.com",
            "Deal Buyer",
            "9000000012",
            "BUYER",
        )
        self.other_owner = create_test_user(
            "deal-other-owner@example.com",
            "Other Owner",
            "9000000013",
            "OWNER",
        )
        self.property = Property.objects.create(
            owner=self.owner,
            title="Deal property",
            description="Deal test property",
            property_type="FLAT",
            listing_type="SALE",
            price="500000.00",
            bedrooms=2,
            bathrooms=2,
            area=1000,
            city="Pune",
            address="Deal address",
        )

    def create_interest(self, interest_status):
        return InterestRequest.objects.create(
            property=self.property,
            buyer=self.buyer,
            status=interest_status,
        )

    def test_valid_positive_agreed_price_is_accepted(self):
        interest = self.create_interest(InterestRequest.Status.ACCEPTED)
        self.client.force_authenticate(self.owner)

        response = self.client.post(
            "/api/deals/create/",
            {
                "interest_request": interest.id,
                "agreed_price": "475000.50",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["deal"]["agreed_price"], "475000.50")

    def test_invalid_agreed_prices_are_rejected(self):
        self.client.force_authenticate(self.owner)

        for invalid_price in ["not-a-number", "0", "-1", "NaN", "Infinity"]:
            with self.subTest(invalid_price=invalid_price):
                interest = self.create_interest(InterestRequest.Status.ACCEPTED)
                response = self.client.post(
                    "/api/deals/create/",
                    {
                        "interest_request": interest.id,
                        "agreed_price": invalid_price,
                    },
                    format="json",
                )

                self.assertEqual(
                    response.status_code,
                    status.HTTP_400_BAD_REQUEST,
                )
                interest.delete()

    def test_only_owner_can_create_deal_from_accepted_interest(self):
        accepted_interest = self.create_interest(InterestRequest.Status.ACCEPTED)
        self.client.force_authenticate(self.other_owner)

        buyer_response = self.client.post(
            "/api/deals/create/",
            {
                "interest_request": accepted_interest.id,
                "agreed_price": "475000",
            },
            format="json",
        )
        self.assertEqual(buyer_response.status_code, status.HTTP_403_FORBIDDEN)
        accepted_interest.delete()

        pending_interest = self.create_interest(InterestRequest.Status.PENDING)
        self.client.force_authenticate(self.owner)

        pending_response = self.client.post(
            "/api/deals/create/",
            {
                "interest_request": pending_interest.id,
                "agreed_price": "475000",
            },
            format="json",
        )
        self.assertEqual(
            pending_response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
