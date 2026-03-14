import csv
import io
from datetime import timedelta
from itertools import chain

from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Profile, Project, SkillCategory, Skill, Experience,
    Message, BlogPost, Testimonial, Education,
    Activity, Achievement, Certification,
)
from .permissions import IsSuperAdmin


# ── Serializers ──────────────────────────────────────────────────────────────

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


class DetailedUserSerializer(serializers.ModelSerializer):
    """Extended user info for the detail drawer."""
    full_name = serializers.CharField(source='profile.full_name', default='')
    username_slug = serializers.CharField(source='profile.username_slug', default='')
    avatar = serializers.URLField(source='profile.avatar', default=None)
    tagline = serializers.CharField(source='profile.tagline', default='')
    bio = serializers.CharField(source='profile.bio', default='')
    github_url = serializers.URLField(source='profile.github_url', default='')
    linkedin_url = serializers.URLField(source='profile.linkedin_url', default='')
    is_platform_admin = serializers.BooleanField(source='profile.is_platform_admin', default=False)
    projects_count = serializers.IntegerField(read_only=True)
    skills_count = serializers.IntegerField(read_only=True)
    experience_count = serializers.IntegerField(read_only=True)
    blog_count = serializers.IntegerField(read_only=True)
    messages_count = serializers.IntegerField(read_only=True)
    testimonials_count = serializers.IntegerField(read_only=True)
    education_count = serializers.IntegerField(read_only=True)
    certifications_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'date_joined', 'last_login', 'is_active',
            'full_name', 'username_slug', 'avatar', 'tagline', 'bio',
            'github_url', 'linkedin_url', 'is_platform_admin',
            'projects_count', 'skills_count', 'experience_count',
            'blog_count', 'messages_count', 'testimonials_count',
            'education_count', 'certifications_count',
        ]
        read_only_fields = fields


# ── Platform Stats ───────────────────────────────────────────────────────────

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
        total_blogs = BlogPost.objects.count()
        total_testimonials = Testimonial.objects.count()

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
            'total_blogs': total_blogs,
            'total_testimonials': total_testimonials,
        })


# ── Analytics ────────────────────────────────────────────────────────────────

class SuperAdminAnalyticsView(APIView):
    """Growth trends and content breakdown for platform analytics."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        now = timezone.now()
        twelve_months_ago = now - timedelta(days=365)

        # User signups by month (last 12 months)
        signup_qs = (
            User.objects
            .filter(date_joined__gte=twelve_months_ago)
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        signups_by_month = [
            {'month': r['month'].strftime('%Y-%m'), 'count': r['count']}
            for r in signup_qs
        ]

        # Content created by month (projects)
        project_qs = (
            Project.objects
            .filter(created_at__gte=twelve_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        projects_by_month = [
            {'month': r['month'].strftime('%Y-%m'), 'count': r['count']}
            for r in project_qs
        ]

        # Content distribution across all users
        content_distribution = {
            'projects': Project.objects.count(),
            'skills': Skill.objects.count(),
            'blog_posts': BlogPost.objects.count(),
            'experience': Experience.objects.count(),
            'testimonials': Testimonial.objects.count(),
            'education': Education.objects.count(),
            'certifications': Certification.objects.count(),
            'achievements': Achievement.objects.count(),
            'activities': Activity.objects.count(),
            'messages': Message.objects.count(),
        }

        # Top users by content
        top_users = (
            User.objects
            .select_related('profile')
            .annotate(
                total_content=Count('projects', distinct=True) +
                              Count('skills', distinct=True) +
                              Count('blog_posts', distinct=True) +
                              Count('experiences', distinct=True)
            )
            .order_by('-total_content')[:5]
        )
        top_users_data = [
            {
                'username': u.username,
                'full_name': getattr(u.profile, 'full_name', '') if hasattr(u, 'profile') else '',
                'total_content': u.total_content,
            }
            for u in top_users
        ]

        return Response({
            'signups_by_month': signups_by_month,
            'projects_by_month': projects_by_month,
            'content_distribution': content_distribution,
            'top_users': top_users_data,
        })


# ── Activity Log ─────────────────────────────────────────────────────────────

class SuperAdminActivityView(APIView):
    """Recent activity feed built from existing model timestamps."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        limit = int(request.query_params.get('limit', 30))
        cutoff = timezone.now() - timedelta(days=90)

        activities = []

        # Recent signups
        for u in User.objects.filter(date_joined__gte=cutoff).select_related('profile').order_by('-date_joined')[:limit]:
            name = getattr(u.profile, 'full_name', u.username) if hasattr(u, 'profile') else u.username
            activities.append({
                'type': 'signup',
                'message': f'{name} (@{u.username}) joined the platform',
                'timestamp': u.date_joined.isoformat(),
                'username': u.username,
            })

        # Recent projects
        for p in Project.objects.select_related('user', 'user__profile').filter(created_at__gte=cutoff).order_by('-created_at')[:limit]:
            name = getattr(p.user.profile, 'full_name', p.user.username) if hasattr(p.user, 'profile') else p.user.username
            activities.append({
                'type': 'project',
                'message': f'{name} created project "{p.title}"',
                'timestamp': p.created_at.isoformat(),
                'username': p.user.username,
            })

        # Recent blog posts
        for b in BlogPost.objects.select_related('user', 'user__profile').filter(created_at__gte=cutoff).order_by('-created_at')[:limit]:
            name = getattr(b.user.profile, 'full_name', b.user.username) if hasattr(b.user, 'profile') else b.user.username
            status_label = 'published' if b.is_published else 'drafted'
            activities.append({
                'type': 'blog',
                'message': f'{name} {status_label} blog post "{b.title}"',
                'timestamp': b.created_at.isoformat(),
                'username': b.user.username,
            })

        # Recent messages
        for m in Message.objects.filter(created_at__gte=cutoff).order_by('-created_at')[:limit]:
            activities.append({
                'type': 'message',
                'message': f'{m.sender_name} sent a message: "{m.subject or "(no subject)"}"',
                'timestamp': m.created_at.isoformat(),
                'username': '',
            })

        # Recent experience entries
        for e in Experience.objects.select_related('user', 'user__profile').filter(created_at__gte=cutoff).order_by('-created_at')[:limit]:
            name = getattr(e.user.profile, 'full_name', e.user.username) if hasattr(e.user, 'profile') else e.user.username
            activities.append({
                'type': 'experience',
                'message': f'{name} added experience: {e.role} at {e.company}',
                'timestamp': e.created_at.isoformat(),
                'username': e.user.username,
            })

        # Sort all by timestamp descending, limit total
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return Response(activities[:limit])


# ── User List ────────────────────────────────────────────────────────────────

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


# ── User Detail (enhanced for drawer) ───────────────────────────────────────

class SuperAdminUserDetailView(APIView):
    """View or manage a specific user (toggle active, delete, detailed stats)."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, user_id):
        try:
            user = (
                User.objects
                .select_related('profile')
                .annotate(
                    projects_count=Count('projects', distinct=True),
                    skills_count=Count('skills', distinct=True),
                    experience_count=Count('experiences', distinct=True),
                    blog_count=Count('blog_posts', distinct=True),
                    messages_count=Count('messages', distinct=True),
                    testimonials_count=Count('testimonials', distinct=True),
                    education_count=Count('educations', distinct=True),
                    certifications_count=Count('certifications', distinct=True),
                )
                .get(id=user_id)
            )
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DetailedUserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, user_id):
        """Toggle user active status."""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

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


# ── Bulk Actions ─────────────────────────────────────────────────────────────

class SuperAdminBulkActionView(APIView):
    """Perform bulk actions on multiple users."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        user_ids = request.data.get('user_ids', [])
        action = request.data.get('action')  # 'activate', 'deactivate', 'delete'

        if not user_ids or not action:
            return Response(
                {'detail': 'user_ids and action are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Never include the requesting admin
        users = User.objects.filter(id__in=user_ids).exclude(id=request.user.id)

        # Never touch platform admins
        admin_profile_ids = Profile.objects.filter(
            is_platform_admin=True
        ).values_list('user_id', flat=True)
        users = users.exclude(id__in=admin_profile_ids)

        count = users.count()

        if action == 'activate':
            users.update(is_active=True)
            return Response({'detail': f'{count} user(s) activated.'})
        elif action == 'deactivate':
            users.update(is_active=False)
            return Response({'detail': f'{count} user(s) deactivated.'})
        elif action == 'delete':
            users.delete()
            return Response({'detail': f'{count} user(s) deleted.'})
        else:
            return Response(
                {'detail': f'Unknown action: {action}'},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ── Export Users (CSV) ───────────────────────────────────────────────────────

class SuperAdminExportUsersView(APIView):
    """Export all users as a CSV file."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        users = (
            User.objects
            .select_related('profile')
            .annotate(
                projects_count=Count('projects', distinct=True),
                skills_count=Count('skills', distinct=True),
                experience_count=Count('experiences', distinct=True),
                blog_count=Count('blog_posts', distinct=True),
                messages_count=Count('messages', distinct=True),
            )
            .order_by('-date_joined')
        )

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="platform_users.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Username', 'Email', 'Full Name', 'Date Joined',
            'Last Login', 'Active', 'Platform Admin',
            'Projects', 'Skills', 'Experience', 'Blog Posts', 'Messages',
        ])

        for u in users:
            profile = getattr(u, 'profile', None)
            writer.writerow([
                u.id,
                u.username,
                u.email,
                profile.full_name if profile else '',
                u.date_joined.strftime('%Y-%m-%d %H:%M'),
                u.last_login.strftime('%Y-%m-%d %H:%M') if u.last_login else 'Never',
                'Yes' if u.is_active else 'No',
                'Yes' if profile and profile.is_platform_admin else 'No',
                u.projects_count,
                u.skills_count,
                u.experience_count,
                u.blog_count,
                u.messages_count,
            ])

        return response


# ── Platform Settings ────────────────────────────────────────────────────────

class SuperAdminSettingsView(APIView):
    """Get and update platform settings (stored in cache/file for simplicity)."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    SETTINGS_DEFAULTS = {
        'allow_registration': True,
        'max_upload_size_mb': 10,
        'platform_name': 'PortfolioHub',
        'maintenance_mode': False,
        'max_projects_per_user': 50,
        'max_blogs_per_user': 100,
        'allow_public_profiles': True,
    }

    def _get_settings_path(self):
        import os
        from django.conf import settings as django_settings
        return os.path.join(django_settings.BASE_DIR, 'platform_settings.json')

    def _load_settings(self):
        import json
        import os
        path = self._get_settings_path()
        if os.path.exists(path):
            with open(path, 'r') as f:
                stored = json.load(f)
                return {**self.SETTINGS_DEFAULTS, **stored}
        return dict(self.SETTINGS_DEFAULTS)

    def _save_settings(self, data):
        import json
        path = self._get_settings_path()
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)

    def get(self, request):
        return Response(self._load_settings())

    def put(self, request):
        current = self._load_settings()
        current.update(request.data)
        self._save_settings(current)
        return Response(current)


# ── Impersonation ────────────────────────────────────────────────────────────

class ImpersonateUserView(APIView):
    """Allow admin to impersonate a user."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.id == request.user.id:
            return Response(
                {'detail': 'You cannot impersonate yourself.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refresh = RefreshToken.for_user(user)
        request.session['original_admin_id'] = request.user.id

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'impersonated_user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': getattr(user.profile, 'full_name', ''),
            },
            'original_admin_id': request.user.id,
        })


class StopImpersonationView(APIView):
    """Stop impersonating and return to admin account."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        original_admin_id = request.data.get('original_admin_id')
        if not original_admin_id:
            return Response(
                {'detail': 'No impersonation session found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            admin_user = User.objects.get(id=original_admin_id)
        except User.DoesNotExist:
            return Response({'detail': 'Original admin user not found.'}, status=status.HTTP_404_NOT_FOUND)

        refresh = RefreshToken.for_user(admin_user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'admin_user': {
                'id': admin_user.id,
                'username': admin_user.username,
                'email': admin_user.email,
            },
        })
