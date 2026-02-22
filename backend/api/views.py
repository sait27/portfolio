import os
import re
import time
from urllib.parse import urlparse

from django.http import HttpResponseRedirect
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

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
    ProjectListSerializer,
    ProjectDetailSerializer,
    ExperienceSerializer,
    EducationSerializer,
    ActivitySerializer,
    AchievementSerializer,
    CertificationSerializer,
    MessageCreateSerializer,
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    TestimonialSerializer,
)
from .throttles import ContactRateThrottle


def get_user_by_username(username):
    """Resolve username to User via Profile.username_slug."""
    try:
        profile = Profile.objects.select_related('user').get(username_slug=username)
        return profile.user
    except Profile.DoesNotExist:
        return None


_CLOUDINARY_VERSION_RE = re.compile(r'^v\d+$')


def _is_public_http_url(value):
    parsed = urlparse(value)
    return parsed.scheme in {'http', 'https'} and bool(parsed.netloc)


def _extract_cloudinary_asset_details(asset_url):
    parsed = urlparse(asset_url)
    if parsed.netloc != 'res.cloudinary.com':
        return None

    path_parts = [part for part in parsed.path.split('/') if part]
    if len(path_parts) < 5:
        return None

    resource_type = path_parts[1]
    delivery_type = path_parts[2]
    version_index = next(
        (index for index, part in enumerate(path_parts) if _CLOUDINARY_VERSION_RE.match(part)),
        None,
    )
    if version_index is None or version_index >= len(path_parts) - 1:
        return None

    public_id_parts = path_parts[version_index + 1:]
    file_name = public_id_parts[-1]
    base_name, extension = os.path.splitext(file_name)
    if resource_type != 'raw' and base_name:
        public_id_parts[-1] = base_name

    public_id = '/'.join(public_id_parts).strip('/')
    if not public_id:
        return None

    return {
        'public_id': public_id,
        'resource_type': resource_type,
        'delivery_type': delivery_type,
        'format': extension.lstrip('.').lower() if extension else '',
    }


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
        serializer = ProfileSerializer(user.profile, context={'request': request})
        return Response(serializer.data)


class PublicResumeView(APIView):
    """
    GET /api/u/{username}/resume/
    Redirects to a resume download URL. Uses signed Cloudinary download links
    when resume assets are hosted on Cloudinary.
    """
    def get(self, request, username):
        user = get_user_by_username(username)
        if not user:
            return Response({'detail': 'Portfolio not found.'}, status=status.HTTP_404_NOT_FOUND)

        resume_url = (getattr(user.profile, 'resume', '') or '').strip()
        if not resume_url:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not _is_public_http_url(resume_url):
            return Response({'detail': 'Resume URL is invalid.'}, status=status.HTTP_400_BAD_REQUEST)
        parsed_resume_url = urlparse(resume_url)
        if parsed_resume_url.path == request.path:
            return Response({'detail': 'Resume URL is invalid.'}, status=status.HTTP_400_BAD_REQUEST)

        cloudinary_asset = _extract_cloudinary_asset_details(resume_url)
        if cloudinary_asset:
            try:
                import cloudinary
                import cloudinary.utils

                cloudinary_config = cloudinary.config()
                if not cloudinary_config.api_key or not cloudinary_config.api_secret:
                    return Response(
                        {
                            'detail': (
                                'Resume delivery is not configured on the server. '
                                'Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
                            )
                        },
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )

                signed_download_url = cloudinary.utils.private_download_url(
                    cloudinary_asset['public_id'],
                    cloudinary_asset['format'] or 'pdf',
                    resource_type=cloudinary_asset['resource_type'],
                    type=cloudinary_asset['delivery_type'],
                    attachment=True,
                    secure=True,
                    expires_at=int(time.time()) + (10 * 60),
                )
                if _is_public_http_url(signed_download_url):
                    return HttpResponseRedirect(signed_download_url)
            except Exception:
                # Fall back to the stored URL when signed URL generation fails.
                pass

        return HttpResponseRedirect(resume_url)


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

class PublicEducationListView(generics.ListAPIView):
    """
    GET /api/u/{username}/education/
    Returns education entries for a user.
    """
    serializer_class = EducationSerializer
    pagination_class = None

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return Education.objects.none()
        return Education.objects.filter(user=user)


class PublicActivityListView(generics.ListAPIView):
    """
    GET /api/u/{username}/activities/
    Returns extracurricular activities for a user.
    """
    serializer_class = ActivitySerializer
    pagination_class = None

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return Activity.objects.none()
        return Activity.objects.filter(user=user)


class PublicAchievementListView(generics.ListAPIView):
    """
    GET /api/u/{username}/achievements/
    Returns achievements for a user.
    """
    serializer_class = AchievementSerializer
    pagination_class = None

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return Achievement.objects.none()
        return Achievement.objects.filter(user=user)


class PublicCertificationListView(generics.ListAPIView):
    """
    GET /api/u/{username}/certifications/
    Returns certifications for a user.
    """
    serializer_class = CertificationSerializer
    pagination_class = None

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return Certification.objects.none()
        return Certification.objects.filter(user=user)


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


# ─── Blog ──────────────────────────────────────────────────────────────────

class PublicBlogListView(generics.ListAPIView):
    """
    GET /api/u/{username}/blog/
    Returns published blog posts for a user.
    """
    serializer_class = BlogPostListSerializer

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return BlogPost.objects.none()
        return BlogPost.objects.filter(user=user, is_published=True)


class PublicBlogDetailView(generics.RetrieveAPIView):
    """
    GET /api/u/{username}/blog/{slug}/
    Returns full detail for a single blog post by slug.
    """
    serializer_class = BlogPostDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return BlogPost.objects.none()
        return BlogPost.objects.filter(user=user, is_published=True)


# ─── Testimonials ──────────────────────────────────────────────────────────

class PublicTestimonialListView(generics.ListAPIView):
    """
    GET /api/u/{username}/testimonials/
    Returns testimonials for a user.
    """
    serializer_class = TestimonialSerializer
    pagination_class = None

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_user_by_username(username)
        if not user:
            return Testimonial.objects.none()
        return Testimonial.objects.filter(user=user)
