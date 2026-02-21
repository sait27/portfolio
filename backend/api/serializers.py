from rest_framework import serializers
from .models import Profile, SkillCategory, Skill, Project, Experience, Message, BlogPost, Testimonial


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
    class Meta:
        model = Profile
        fields = [
            'id', 'username_slug', 'full_name', 'tagline', 'bio', 'avatar', 'resume',
            'github_url', 'linkedin_url', 'twitter_url', 'email',
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
