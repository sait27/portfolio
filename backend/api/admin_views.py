from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

import cloudinary
import cloudinary.uploader

from .models import Profile, SkillCategory, Skill, Project, Experience, Message
from .serializers import (
    ProfileSerializer,
    SkillCategorySerializer,
    SkillSerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
    ExperienceSerializer,
    MessageListSerializer,
)
from .permissions import IsAdminOwner


# ─── Admin Profile ──────────────────────────────────────────────────────────

class AdminProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/admin/profile/  — Read profile
    PUT  /api/admin/profile/  — Update profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]

    def get_object(self):
        profile = Profile.objects.first()
        if not profile:
            # Auto-create a blank profile if none exists
            profile = Profile.objects.create(
                full_name="Your Name",
                tagline="Your Tagline",
                bio="Write your bio here...",
                email="you@example.com"
            )
        return profile


# ─── Admin Projects CRUD ───────────────────────────────────────────────────

class AdminProjectListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/projects/  — List ALL projects (including hidden)
    POST /api/admin/projects/  — Create a new project
    """
    queryset = Project.objects.all().prefetch_related('tech_stack')
    permission_classes = [IsAuthenticated, IsAdminOwner]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectDetailSerializer
        return ProjectListSerializer


class AdminProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/projects/{id}/  — Read full project detail
    PUT    /api/admin/projects/{id}/  — Update project
    DELETE /api/admin/projects/{id}/  — Delete project
    """
    queryset = Project.objects.all().prefetch_related('tech_stack')
    serializer_class = ProjectDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]


# ─── Admin Skills CRUD ─────────────────────────────────────────────────────

class AdminSkillListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/skills/  — List all skills
    POST /api/admin/skills/  — Create a new skill
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]
    pagination_class = None


class AdminSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/skills/{id}/  — Read skill
    PUT    /api/admin/skills/{id}/  — Update skill
    DELETE /api/admin/skills/{id}/  — Delete skill
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]


# ─── Admin Skill Categories CRUD ──────────────────────────────────────────

class AdminSkillCategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/skill-categories/  — List all categories
    POST /api/admin/skill-categories/  — Create a new category
    """
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]
    pagination_class = None


class AdminSkillCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/skill-categories/{id}/  — Read category
    PUT    /api/admin/skill-categories/{id}/  — Update category
    DELETE /api/admin/skill-categories/{id}/  — Delete category
    """
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]


# ─── Admin Experience CRUD ─────────────────────────────────────────────────

class AdminExperienceListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/experience/  — List all experience entries
    POST /api/admin/experience/  — Create a new experience entry
    """
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]
    pagination_class = None


class AdminExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/experience/{id}/  — Read experience
    PUT    /api/admin/experience/{id}/  — Update experience
    DELETE /api/admin/experience/{id}/  — Delete experience
    """
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]


# ─── Admin Messages ────────────────────────────────────────────────────────

class AdminMessageListView(generics.ListAPIView):
    """
    GET /api/admin/messages/  — List all contact messages
    """
    queryset = Message.objects.all()
    serializer_class = MessageListSerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]


class AdminMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/messages/{id}/  — Read message detail
    PATCH  /api/admin/messages/{id}/  — Mark as read/unread
    DELETE /api/admin/messages/{id}/  — Delete message
    """
    queryset = Message.objects.all()
    serializer_class = MessageListSerializer
    permission_classes = [IsAuthenticated, IsAdminOwner]


# ─── Admin Image Upload (Cloudinary) ───────────────────────────────────────

class AdminUploadView(APIView):
    """
    POST /api/admin/upload/
    Upload an image to Cloudinary and return the URL.

    Body: multipart/form-data with 'file' field
    Returns: { "url": "https://res.cloudinary.com/..." }
    """
    permission_classes = [IsAuthenticated, IsAdminOwner]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response(
                {"detail": "No file provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine folder based on content type
        folder = 'portfolio/images'
        if file.content_type == 'application/pdf':
            folder = 'portfolio/documents'

        try:
            result = cloudinary.uploader.upload(
                file,
                folder=folder,
                resource_type='auto',
                quality='auto',
                fetch_format='auto',
            )
            return Response({
                "url": result['secure_url'],
                "public_id": result['public_id'],
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"detail": f"Upload failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─── Admin Dashboard Stats ────────────────────────────────────────────────

class AdminDashboardView(APIView):
    """
    GET /api/admin/dashboard/
    Returns overview stats for the admin dashboard.
    """
    permission_classes = [IsAuthenticated, IsAdminOwner]

    def get(self, request):
        return Response({
            "total_projects": Project.objects.count(),
            "visible_projects": Project.objects.filter(is_visible=True).count(),
            "featured_projects": Project.objects.filter(is_featured=True).count(),
            "total_skills": Skill.objects.count(),
            "total_categories": SkillCategory.objects.count(),
            "total_experience": Experience.objects.count(),
            "total_messages": Message.objects.count(),
            "unread_messages": Message.objects.filter(is_read=False).count(),
        })
