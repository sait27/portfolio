from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile, SkillCategory, Skill, Project, Experience, Message
from .serializers import (
    ProfileSerializer,
    SkillCategorySerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
    ExperienceSerializer,
    MessageCreateSerializer,
)
from .throttles import ContactRateThrottle


def get_user_by_username(username):
    """Resolve username to User via Profile.username_slug."""
    try:
        profile = Profile.objects.select_related('user').get(username_slug=username)
        return profile.user
    except Profile.DoesNotExist:
        return None


# ─── Profile ────────────────────────────────────────────────────────────────

class PublicProfileView(APIView):
    """
    GET /api/u/{username}/profile/
    Returns the user's profile.
    """
    def get(self, request, username):
        user = get_user_by_username(username)
        if not user:
            return Response({'detail': 'Portfolio not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProfileSerializer(user.profile)
        return Response(serializer.data)


# ─── Skills ─────────────────────────────────────────────────────────────────

class PublicSkillListView(generics.ListAPIView):
    """
    GET /api/u/{username}/skills/
    Returns all skills grouped by category for a user.
    """
    serializer_class = SkillCategorySerializer
    pagination_class = None

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return SkillCategory.objects.none()
        return SkillCategory.objects.filter(user=user).prefetch_related('skills')


# ─── Projects ──────────────────────────────────────────────────────────────

class PublicProjectListView(generics.ListAPIView):
    """
    GET /api/u/{username}/projects/
    Returns visible projects for a user. Supports ?category= and ?featured= filters.
    """
    serializer_class = ProjectListSerializer

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return Project.objects.none()

        queryset = Project.objects.filter(user=user, is_visible=True).prefetch_related('tech_stack')
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        return queryset


class PublicProjectDetailView(generics.RetrieveAPIView):
    """
    GET /api/u/{username}/projects/{slug}/
    Returns full detail for a single project by slug.
    """
    serializer_class = ProjectDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return Project.objects.none()
        return Project.objects.filter(user=user, is_visible=True).prefetch_related('tech_stack')


# ─── Experience ─────────────────────────────────────────────────────────────

class PublicExperienceListView(generics.ListAPIView):
    """
    GET /api/u/{username}/experience/
    Returns experience timeline for a user.
    """
    serializer_class = ExperienceSerializer
    pagination_class = None

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return Experience.objects.none()
        return Experience.objects.filter(user=user)


# ─── Contact ───────────────────────────────────────────────────────────────

class PublicContactView(generics.CreateAPIView):
    """
    POST /api/u/{username}/contact/
    Submit a contact message to a specific user.
    """
    serializer_class = MessageCreateSerializer
    throttle_classes = [ContactRateThrottle]

    def create(self, request, *args, **kwargs):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return Response({'detail': 'Portfolio not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(recipient=user)
        return Response(
            {'detail': 'Message sent successfully!'},
            status=status.HTTP_201_CREATED
        )
