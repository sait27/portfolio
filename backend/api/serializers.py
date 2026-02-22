from rest_framework import serializers
from django.urls import reverse
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

DASHBOARD_SECTION_IDS = ['portfolio_metrics', 'quick_actions', 'needs_attention']


# ─── Skill Serializers ──────────────────────────────────────────────────────

class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Skill
        fields = ['id', 'name', 'icon', 'category', 'category_name', 'order']
        extra_kwargs = {
            'category': {'required': True},
        }


class SkillCategorySerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'slug', 'order', 'skills']
        extra_kwargs = {
            'slug': {'read_only': True},
        }


# ─── Profile Serializer ────────────────────────────────────────────────────

class ProfileSerializer(serializers.ModelSerializer):
    resume_download_url = serializers.SerializerMethodField(read_only=True)

    def validate_dashboard_section_order(self, value):
        if value in (None, []):
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('dashboard_section_order must be a list.')
        if len(value) != len(DASHBOARD_SECTION_IDS):
            raise serializers.ValidationError('dashboard_section_order must contain all dashboard sections.')
        if len(set(value)) != len(value):
            raise serializers.ValidationError('dashboard_section_order cannot contain duplicates.')
        if any(section_id not in DASHBOARD_SECTION_IDS for section_id in value):
            raise serializers.ValidationError('dashboard_section_order contains unsupported section ids.')
        return value

    def get_resume_download_url(self, obj):
        if not obj.resume or not obj.username_slug:
            return ''
        resume_path = reverse('public-resume', kwargs={'username': obj.username_slug})
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(resume_path)
        return resume_path

    class Meta:
        model = Profile
        fields = [
            'id', 'username_slug', 'full_name', 'tagline', 'bio', 'avatar', 'resume', 'resume_download_url',
            'github_url', 'linkedin_url', 'twitter_url', 'email',
            'show_hero', 'show_about', 'show_highlights', 'show_skills',
            'show_projects', 'show_experience', 'show_education', 'show_activities',
            'show_achievements', 'show_certifications', 'show_blog',
            'show_testimonials', 'show_contact',
            'show_nav_about', 'show_nav_skills', 'show_nav_projects',
            'show_nav_experience', 'show_nav_education', 'show_nav_activities',
            'show_nav_achievements', 'show_nav_certifications', 'show_nav_blog',
            'show_nav_testimonials', 'show_nav_contact', 'dashboard_section_order',
            'updated_at'
        ]
        extra_kwargs = {
            'username_slug': {'read_only': True},
        }


# ─── Project Serializers ───────────────────────────────────────────────────

class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for project cards (list view)."""
    tech_stack = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'thumbnail', 'short_description',
            'tech_stack', 'category', 'is_featured', 'date_built'
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Full serializer for single project view."""
    tech_stack = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'thumbnail', 'description',
            'short_description', 'tech_stack', 'category',
            'live_url', 'repo_url', 'is_featured', 'is_visible',
            'date_built', 'created_at', 'updated_at'
        ]


# ─── Experience Serializer ──────────────────────────────────────────────────

class ExperienceSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = [
            'id', 'role', 'company', 'company_url',
            'start_date', 'end_date', 'is_current',
            'highlights', 'duration', 'order'
        ]

    def get_duration(self, obj):
        """Compute human-readable duration string."""
        start = obj.start_date.strftime('%b %Y')
        end = 'Present' if obj.is_current or not obj.end_date else obj.end_date.strftime('%b %Y')
        return f"{start} — {end}"


# ─── Message Serializer ─────────────────────────────────────────────────────

class EducationSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = [
            'id', 'institution', 'degree', 'field_of_study',
            'start_date', 'end_date', 'is_current', 'grade',
            'description', 'duration', 'order'
        ]

    def get_duration(self, obj):
        if not obj.start_date and not obj.end_date and not obj.is_current:
            return 'Not specified'
        start = obj.start_date.strftime('%b %Y') if obj.start_date else 'N/A'
        end = 'Present' if obj.is_current or not obj.end_date else obj.end_date.strftime('%b %Y')
        return f"{start} â€” {end}"


class ActivitySerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'title', 'organization', 'role',
            'start_date', 'end_date', 'is_current',
            'highlights', 'description', 'duration', 'order'
        ]

    def get_duration(self, obj):
        if not obj.start_date and not obj.end_date and not obj.is_current:
            return 'Not specified'
        start = obj.start_date.strftime('%b %Y') if obj.start_date else 'N/A'
        end = 'Present' if obj.is_current or not obj.end_date else obj.end_date.strftime('%b %Y')
        return f"{start} â€” {end}"


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = [
            'id', 'title', 'issuer', 'achieved_on',
            'description', 'proof_url', 'order'
        ]


class CertificationSerializer(serializers.ModelSerializer):
    validity = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            'id', 'name', 'issuer', 'issue_date', 'expiry_date',
            'credential_id', 'credential_url', 'skills', 'validity', 'order'
        ]

    def get_validity(self, obj):
        if not obj.issue_date and not obj.expiry_date:
            return 'Not specified'
        start = obj.issue_date.strftime('%b %Y') if obj.issue_date else 'N/A'
        end = obj.expiry_date.strftime('%b %Y') if obj.expiry_date else 'No expiry'
        return f"{start} â€” {end}"


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a message (public contact form)."""

    class Meta:
        model = Message
        fields = ['sender_name', 'sender_email', 'subject', 'content', 'honeypot']
        extra_kwargs = {
            'honeypot': {'required': False, 'write_only': True},
        }

    def validate(self, data):
        """Reject submissions where the honeypot field is filled (bot detection)."""
        if data.get('honeypot'):
            raise serializers.ValidationError("Spam detected.")
        return data


class MessageListSerializer(serializers.ModelSerializer):
    """Serializer for admin message inbox."""

    class Meta:
        model = Message
        fields = ['id', 'sender_name', 'sender_email', 'subject', 'content', 'is_read', 'created_at']


# ─── Blog Post Serializers ──────────────────────────────────────────────────

class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for blog post cards."""
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'thumbnail', 'tags',
            'read_time', 'is_published', 'is_featured', 'published_at'
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Full serializer for single blog post view."""
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'thumbnail',
            'tags', 'read_time', 'is_published', 'is_featured',
            'published_at', 'created_at', 'updated_at'
        ]


# ─── Testimonial Serializer ─────────────────────────────────────────────────

class TestimonialSerializer(serializers.ModelSerializer):
    """Serializer for testimonials."""
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'client_name', 'client_role', 'client_company',
            'client_avatar', 'content', 'rating', 'project_name',
            'is_featured', 'order'
        ]
