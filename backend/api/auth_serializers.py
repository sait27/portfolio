from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Profile


class RegisterSerializer(serializers.Serializer):
    """Register a new user. Creates User + Profile."""
    username = serializers.CharField(max_length=30, min_length=3)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=100)

    def validate_username(self, value):
        value = value.lower().strip()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        # Only allow alphanumeric and hyphens
        import re
        if not re.match(r'^[a-z0-9_-]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, hyphens, and underscores.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        Profile.objects.create(
            user=user,
            full_name=validated_data['full_name'],
            email=validated_data['email'],
            username_slug=validated_data['username'],
        )
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    """Request a password reset email."""
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password with token from email."""
    token = serializers.CharField()
    uid = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Change password (authenticated user)."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
