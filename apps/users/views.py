from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
)


class UsersApiRootView(APIView):
    permission_classes = []

    def get(self, request):
        return Response(
            {
                "message": "Users API is working",
                "endpoints": {
                    "register": "/api/users/register/",
                    "login": "/api/users/login/",
                    "token_refresh": "/api/users/token/refresh/",
                    "me": "/api/users/me/",
                },
            },
            status=status.HTTP_200_OK,
        )


class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "User registered successfully.",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)

        return Response(
            {
                "message": "Authenticated successfully.",
                "user": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Profile updated successfully.",
                "user": UserSerializer(request.user).data,
            },
            status=status.HTTP_200_OK,
        )
