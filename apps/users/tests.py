from django.test import TestCase


class UsersApiRootTests(TestCase):
    def test_users_api_root_returns_endpoint_list(self):
        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "message": "Users API is working",
                "endpoints": {
                    "register": "/api/users/register/",
                    "login": "/api/users/login/",
                    "token_refresh": "/api/users/token/refresh/",
                    "me": "/api/users/me/",
                },
            },
        )

    def test_api_root_remains_unconfigured(self):
        response = self.client.get("/api/")

        self.assertEqual(response.status_code, 404)
