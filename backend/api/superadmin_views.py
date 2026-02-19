from django.contrib.auth.models import User
from django.db.models import Count, Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers

from .models import Profile, Project, SkillCategory, Skill, Experience, Message
from .permissions import IsSuperAdmin


# ── Serializers (kept here since they're super-admin-only) ───────────────

class PlatformUserSerializer(serializers.ModelSerializer):
    """Serializer for listing platform users in super admin panel."""
    full_name = serializers.CharField(source='profile.full_name', default='')
    username_slug = serializers.CharField(source='profile.username_slug', default='')
    avatar = serializers.URLField(source='profile.avatar', default=None)
    is_platform_admin = serializers.BooleanField(source='profile.is_platform_admin', default=False)
    projects_count = serializers.IntegerField(read_only=True)
    skills_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'date_joined', 'is_active',
            'full_name', 'username_slug', 'avatar', 'is_platform_admin',
            'projects_count', 'skills_count',
        ]
        read_only_fields = fields


# ── Platform Stats ───────────────────────────────────────────────────────

class SuperAdminStatsView(APIView):
    """Platform-wide statistics for super admin."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        total_projects = Project.objects.count()
        total_skills = Skill.objects.count()
        total_messages = Message.objects.count()
        total_experience = Experience.objects.count()
        total_categories = SkillCategory.objects.count()

        # Recent signups (last 30 days)
        from django.utils import timezone
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_signups = User.objects.filter(date_joined__gte=thirty_days_ago).count()

        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'recent_signups': recent_signups,
            'total_projects': total_projects,
            'total_skills': total_skills,
            'total_categories': total_categories,
            'total_experience': total_experience,
            'total_messages': total_messages,
        })


# ── User List ────────────────────────────────────────────────────────────

class SuperAdminUserListView(generics.ListAPIView):
    """List all platform users with their stats."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = PlatformUserSerializer

    def get_queryset(self):
        return (
            User.objects
            .select_related('profile')
            .annotate(
                projects_count=Count('projects', distinct=True),
                skills_count=Count('skills', distinct=True),
            )
            .order_by('-date_joined')
        )


# ── User Detail / Toggle Active ──────────────────────────────────────────

class SuperAdminUserDetailView(APIView):
    """View or manage a specific user (toggle active, etc.)."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, user_id):
        try:
            user = User.objects.select_related('profile').annotate(
                projects_count=Count('projects', distinct=True),
                skills_count=Count('skills', distinct=True),
            ).get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PlatformUserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, user_id):
        """Toggle user active status."""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Don't allow deactivating yourself
        if user.id == request.user.id:
            return Response(
                {'detail': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_active = request.data.get('is_active')
        if is_active is not None:
            user.is_active = is_active
            user.save(update_fields=['is_active'])

        return Response({'id': user.id, 'is_active': user.is_active})

    def delete(self, request, user_id):
        """Delete a user and all their data."""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Don't allow deleting yourself
        if user.id == request.user.id:
            return Response(
                {'detail': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = user.username
        user.delete()
        return Response(
            {'detail': f'User "{username}" and all their data have been deleted.'},
            status=status.HTTP_200_OK,
        )
