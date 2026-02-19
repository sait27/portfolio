from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .auth_serializers import (
    RegisterSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
)


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Create a new user account + profile.
    Returns JWT tokens on success.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'detail': 'Account created successfully!',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.profile.full_name,
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Send a password reset email with token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email__iexact=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # In production, send email. For now, log reset link.
            reset_url = f"/reset-password/{uid}/{token}"
            print(f"\n{'='*60}")
            print(f"PASSWORD RESET LINK (dev mode)")
            print(f"User: {user.username} ({user.email})")
            print(f"URL: {reset_url}")
            print(f"{'='*60}\n")
        except User.DoesNotExist:
            pass  # Don't reveal whether email exists

        # Always return success (security: don't reveal if email exists)
        return Response({
            'detail': 'If an account with that email exists, we have sent a reset link.'
        })


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Reset password using uid + token from email link.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, serializer.validated_data['token']):
            return Response({'detail': 'Reset link has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({'detail': 'Password has been reset successfully!'})


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Change password for authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        return Response({'detail': 'Password changed successfully!'})


class MeView(APIView):
    """
    GET /api/auth/me/
    Return current user info + profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': profile.full_name if profile else '',
            'username_slug': profile.username_slug if profile else '',
            'is_platform_admin': profile.is_platform_admin if profile else False,
            'avatar': profile.avatar if profile else '',
        })
