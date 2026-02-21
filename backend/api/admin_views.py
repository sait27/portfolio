from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Profile, SkillCategory, Skill, Project, Experience, Message, BlogPost, Testimonial
from .serializers import (
    ProfileSerializer,
    SkillCategorySerializer,
    SkillSerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
    ExperienceSerializer,
    MessageListSerializer,
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    TestimonialSerializer,
)


# ─── Dashboard Stats ───────────────────────────────────────────────────────

class DashboardStatsView(APIView):
    """
    GET /api/dashboard/stats/
    Returns dashboard stats for the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'projects': Project.objects.filter(user=user).count(),
            'featured_projects': Project.objects.filter(user=user, is_featured=True).count(),
            'skills': Skill.objects.filter(user=user).count(),
            'categories': SkillCategory.objects.filter(user=user).count(),
            'experience': Experience.objects.filter(user=user).count(),
            'messages': Message.objects.filter(recipient=user).count(),
            'unread_messages': Message.objects.filter(recipient=user, is_read=False).count(),
            'blog_posts': BlogPost.objects.filter(user=user).count(),
            'published_posts': BlogPost.objects.filter(user=user, is_published=True).count(),
            'testimonials': Testimonial.objects.filter(user=user).count(),
        })


# ─── Dashboard Profile ─────────────────────────────────────────────────────

class DashboardProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/dashboard/profile/  — Read own profile
    PUT  /api/dashboard/profile/  — Update own profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'full_name': self.request.user.username,
                'email': self.request.user.email,
                'username_slug': self.request.user.username,
            }
        )
        return profile


# ─── Dashboard Projects CRUD ──────────────────────────────────────────────

class DashboardProjectListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/projects/  — List own projects
    POST /api/dashboard/projects/  — Create a new project
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).prefetch_related('tech_stack')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectDetailSerializer
        return ProjectListSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/projects/{id}/  — Read own project
    PUT    /api/dashboard/projects/{id}/  — Update own project
    DELETE /api/dashboard/projects/{id}/  — Delete own project
    """
    serializer_class = ProjectDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).prefetch_related('tech_stack')


# ─── Dashboard Skills CRUD ────────────────────────────────────────────────

class DashboardSkillListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/skills/  — List own skills
    POST /api/dashboard/skills/  — Create a new skill
    """
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/skills/{id}/  — Read own skill
    PUT    /api/dashboard/skills/{id}/  — Update own skill
    DELETE /api/dashboard/skills/{id}/  — Delete own skill
    """
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)


# ─── Dashboard Skill Categories CRUD ──────────────────────────────────────

class DashboardCategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/skill-categories/  — List own categories
    POST /api/dashboard/skill-categories/  — Create a new category
    """
    serializer_class = SkillCategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return SkillCategory.objects.filter(user=self.request.user).prefetch_related('skills')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/skill-categories/{id}/  — Read own category
    PUT    /api/dashboard/skill-categories/{id}/  — Update own category
    DELETE /api/dashboard/skill-categories/{id}/  — Delete own category
    """
    serializer_class = SkillCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SkillCategory.objects.filter(user=self.request.user)


# ─── Dashboard Experience CRUD ────────────────────────────────────────────

class DashboardExperienceListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/experience/  — List own experience
    POST /api/dashboard/experience/  — Create a new experience entry
    """
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/experience/{id}/  — Read own experience
    PUT    /api/dashboard/experience/{id}/  — Update own experience
    DELETE /api/dashboard/experience/{id}/  — Delete own experience
    """
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user)


# ─── Dashboard Messages ───────────────────────────────────────────────────

class DashboardMessageListView(generics.ListAPIView):
    """
    GET /api/dashboard/messages/  — List own messages
    """
    serializer_class = MessageListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(recipient=self.request.user)


class DashboardMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/messages/{id}/  — Read own message
    PATCH  /api/dashboard/messages/{id}/  — Mark as read/unread
    DELETE /api/dashboard/messages/{id}/  — Delete own message
    """
    serializer_class = MessageListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(recipient=self.request.user)


# ─── Dashboard Upload (Cloudinary) ────────────────────────────────────────

class DashboardUploadView(APIView):
    """
    POST /api/dashboard/upload/
    Upload a file to Cloudinary. Returns the secure URL.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Size limit: 10MB
        if file.size > 10 * 1024 * 1024:
            return Response({'detail': 'File too large. Max 10MB.'}, status=status.HTTP_400_BAD_REQUEST)

        import cloudinary.uploader
        try:
            result = cloudinary.uploader.upload(
                file,
                folder=f'portfolio/{request.user.username}',
                resource_type='auto'
            )
            return Response({
                'url': result['secure_url'],
                'public_id': result['public_id'],
            })
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── Dashboard Blog Posts CRUD ────────────────────────────────────────────

class DashboardBlogListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/blog/  — List own blog posts
    POST /api/dashboard/blog/  — Create a new blog post
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BlogPost.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardBlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/blog/{id}/  — Read own blog post
    PUT    /api/dashboard/blog/{id}/  — Update own blog post
    DELETE /api/dashboard/blog/{id}/  — Delete own blog post
    """
    serializer_class = BlogPostDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BlogPost.objects.filter(user=self.request.user)


# ─── Dashboard Testimonials CRUD ──────────────────────────────────────────

class DashboardTestimonialListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/testimonials/  — List own testimonials
    POST /api/dashboard/testimonials/  — Create a new testimonial
    """
    serializer_class = TestimonialSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Testimonial.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardTestimonialDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/testimonials/{id}/  — Read own testimonial
    PUT    /api/dashboard/testimonials/{id}/  — Update own testimonial
    DELETE /api/dashboard/testimonials/{id}/  — Delete own testimonial
    """
    serializer_class = TestimonialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Testimonial.objects.filter(user=self.request.user)
