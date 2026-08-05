from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

from apps.common.responses import APIResponse
from apps.accounts.serializers import (
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    Endpoint for users to register their account.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_data = UserSerializer(user, context={'request': request}).data
        
        # Optionally generate tokens immediately upon registration
        refresh = RefreshToken.for_user(user)
        data = {
            "user": user_data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }
        return APIResponse(
            success=True,
            message="User registered successfully.",
            data=data,
            status=status.HTTP_201_CREATED
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT Login View returning the standard JSON format.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        user = User.objects.get(email=request.data.get('email'))
        user_data = UserSerializer(user, context={'request': request}).data
        
        data = {
            "user": user_data,
            "tokens": serializer.validated_data
        }
        
        return APIResponse(
            success=True,
            message="Login successful.",
            data=data,
            status=status.HTTP_200_OK
        )


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom JWT Token Refresh View returning the standard JSON format.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return APIResponse(
            success=True,
            message="Token refreshed successfully.",
            data=serializer.validated_data,
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    Blacklists the user's refresh token to log them out.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return APIResponse(
                    success=False,
                    message="Refresh token is required.",
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            return APIResponse(
                success=True,
                message="Logout successful.",
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return APIResponse(
                success=False,
                message="Token is invalid or already blacklisted.",
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieves and updates the authenticated user's profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse(
            success=True,
            message="Profile retrieved successfully.",
            data=serializer.data
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return APIResponse(
            success=True,
            message="Profile updated successfully.",
            data=serializer.data
        )


class ChangePasswordView(APIView):
    """
    Endpoint for password change for authenticated users.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return APIResponse(
                success=False,
                message="Incorrect current password.",
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return APIResponse(
            success=True,
            message="Password updated successfully."
        )


class ForgotPasswordView(APIView):
    """
    Initiates password reset process and returns token + uidb64.
    In production, this would send an email, but here we return it directly.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        # Here we mock sending email by returning details.
        # This keeps the application fully functional and self-testable.
        data = {
            "uidb64": uid,
            "token": token,
            "instructions": "Use these fields in the reset-password endpoint to complete the reset process."
        }
        
        # Log to terminal console for ease of testing
        print(f"\n--- PASSWORD RESET REQUEST FOR {email} ---")
        print(f"UIDB64: {uid}")
        print(f"Token: {token}")
        print(f"-----------------------------------------\n")
        
        return APIResponse(
            success=True,
            message="Password reset parameters generated. Use them to reset your password.",
            data=data
        )


class ResetPasswordView(APIView):
    """
    Resets user password using uidb64 and token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return APIResponse(
            success=True,
            message="Password has been reset successfully."
        )
