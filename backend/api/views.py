from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile, SkillCategory, Skill, Project, Experience, Message
from .serializers import (
    ProfileSerializer,
    SkillCategorySerializer,
    SkillSerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
    ExperienceSerializer,
    MessageCreateSerializer,
)
from .throttles import ContactRateThrottle


# ─── Profile ────────────────────────────────────────────────────────────────

class ProfileView(APIView):
    """
    GET /api/profile/
    Returns the single Profile record.
    """

    def get(self, request):
        profile = Profile.objects.first()
        if not profile:
            return Response(
                {"detail": "Profile not configured yet."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)


# ─── Skills ─────────────────────────────────────────────────────────────────

class SkillCategoryListView(generics.ListAPIView):
    """
    GET /api/skill-categories/
    Returns all skill categories.
    """
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer
    pagination_class = None  # Return all categories, no pagination


class SkillListView(generics.ListAPIView):
    """
    GET /api/skills/
    Returns all skills grouped by category.
    """
    queryset = SkillCategory.objects.prefetch_related('skills').all()
    serializer_class = SkillCategorySerializer
    pagination_class = None  # Return everything grouped


# ─── Projects ──────────────────────────────────────────────────────────────

class ProjectListView(generics.ListAPIView):
    """
    GET /api/projects/
    Returns visible projects. Supports ?category= filter.
    """
    serializer_class = ProjectListSerializer

    def get_queryset(self):
        queryset = Project.objects.filter(is_visible=True).prefetch_related('tech_stack')
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        return queryset


class ProjectDetailView(generics.RetrieveAPIView):
    """
    GET /api/projects/{slug}/
    Returns full detail for a single project by slug.
    """
    queryset = Project.objects.filter(is_visible=True).prefetch_related('tech_stack')
    serializer_class = ProjectDetailSerializer
    lookup_field = 'slug'


# ─── Experience ─────────────────────────────────────────────────────────────

class ExperienceListView(generics.ListAPIView):
    """
    GET /api/experience/
    Returns experience timeline entries.
    """
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    pagination_class = None  # Timeline shows all entries


# ─── Contact ───────────────────────────────────────────────────────────────

class ContactCreateView(generics.CreateAPIView):
    """
    POST /api/contact/
    Submits a new message from the contact form.
    Rate limited to 3 submissions per hour per IP.
    """
    serializer_class = MessageCreateSerializer
    throttle_classes = [ContactRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Message sent successfully! I'll get back to you soon."},
            status=status.HTTP_201_CREATED
        )
