from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import (
    Profile,
    SkillCategory,
    Skill,
    Project,
    Experience,
    Education,
    Activity,
    Achievement,
    Certification,
    Message,
    BlogPost,
    Testimonial,
)
from .serializers import (
    ProfileSerializer,
    SkillCategorySerializer,
    SkillSerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
    ExperienceSerializer,
    EducationSerializer,
    ActivitySerializer,
    AchievementSerializer,
    CertificationSerializer,
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
            'education': Education.objects.filter(user=user).count(),
            'activities': Activity.objects.filter(user=user).count(),
            'achievements': Achievement.objects.filter(user=user).count(),
            'certifications': Certification.objects.filter(user=user).count(),
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

class DashboardEducationListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/education/  — List own education entries
    POST /api/dashboard/education/  — Create a new education entry
    """
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardEducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/education/{id}/  — Read own education entry
    PUT    /api/dashboard/education/{id}/  — Update own education entry
    DELETE /api/dashboard/education/{id}/  — Delete own education entry
    """
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)


class DashboardActivityListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/activities/  — List own extracurricular activities
    POST /api/dashboard/activities/  — Create a new extracurricular activity
    """
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/activities/{id}/  — Read own extracurricular activity
    PUT    /api/dashboard/activities/{id}/  — Update own extracurricular activity
    DELETE /api/dashboard/activities/{id}/  — Delete own extracurricular activity
    """
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)


class DashboardAchievementListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/achievements/  — List own achievements
    POST /api/dashboard/achievements/  — Create a new achievement
    """
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Achievement.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardAchievementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/achievements/{id}/  — Read own achievement
    PUT    /api/dashboard/achievements/{id}/  — Update own achievement
    DELETE /api/dashboard/achievements/{id}/  — Delete own achievement
    """
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Achievement.objects.filter(user=self.request.user)


class DashboardCertificationListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/dashboard/certifications/  — List own certifications
    POST /api/dashboard/certifications/  — Create a new certification
    """
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardCertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/dashboard/certifications/{id}/  — Read own certification
    PUT    /api/dashboard/certifications/{id}/  — Update own certification
    DELETE /api/dashboard/certifications/{id}/  — Delete own certification
    """
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)


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

        upload_context = (request.data.get('upload_context') or '').strip().lower()

        # Size limit: 10MB
        if file.size > 10 * 1024 * 1024:
            return Response({'detail': 'File too large. Max 10MB.'}, status=status.HTTP_400_BAD_REQUEST)

        file_name = (file.name or '').lower()
        content_type = (getattr(file, 'content_type', '') or '').lower()

        upload_options = {
            'folder': f'portfolio/{request.user.username}',
            'resource_type': 'auto',
        }

        # Resume files should be strict PDF to avoid broken/non-renderable document links.
        if upload_context == 'resume':
            is_pdf = file_name.endswith('.pdf') or content_type == 'application/pdf'
            if not is_pdf:
                return Response({'detail': 'Resume must be a PDF file.'}, status=status.HTTP_400_BAD_REQUEST)
            upload_options['resource_type'] = 'raw'

        import cloudinary.uploader
        try:
            result = cloudinary.uploader.upload(file, **upload_options)
            response_payload = {
                'url': result['secure_url'],
                'public_id': result['public_id'],
            }
            return Response({
                **response_payload
            })
        except Exception as e:
            message = str(e)
            lower_message = message.lower()
            if upload_context == 'resume' and (
                'pdf' in lower_message
                or 'zip' in lower_message
                or 'show_original_customer_untrusted' in lower_message
                or 'untrusted' in lower_message
            ):
                message = (
                    'Resume upload failed due to Cloudinary account trust/security settings. '
                    'Enable PDF delivery in Cloudinary Security settings or complete account trust verification.'
                )
            return Response({'detail': message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
