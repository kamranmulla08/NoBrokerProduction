from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import MyProfileView, RegisterView, UsersApiRootView


urlpatterns = [
    path("", UsersApiRootView.as_view(), name="users_api_root"),

    # User registration
    path("register/", RegisterView.as_view(), name="register"),

    # JWT login
    path("login/", TokenObtainPairView.as_view(), name="login"),

    # Get a new access token using refresh token
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Get currently authenticated user's profile
    path("me/", MyProfileView.as_view(), name="my_profile"),
]