from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


# ─── Profile (One per User) ────────────────────────────────────────────────

class Profile(models.Model):
    """User profile — one per registered user."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    username_slug = models.SlugField(unique=True, help_text="Public URL slug, e.g., /sait27")
    full_name = models.CharField(max_length=100)
    tagline = models.CharField(max_length=200, blank=True, help_text="e.g., Full-Stack Python Developer")
    bio = models.TextField(blank=True)
    avatar = models.URLField(blank=True, help_text="Cloudinary URL for profile photo")
    resume = models.URLField(blank=True, help_text="Cloudinary URL for resume PDF")
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    email = models.EmailField()
    show_hero = models.BooleanField(default=True)
    show_about = models.BooleanField(default=True)
    show_highlights = models.BooleanField(default=True)
    show_skills = models.BooleanField(default=True)
    show_projects = models.BooleanField(default=True)
    show_experience = models.BooleanField(default=True)
    show_education = models.BooleanField(default=True)
    show_activities = models.BooleanField(default=True)
    show_achievements = models.BooleanField(default=True)
    show_certifications = models.BooleanField(default=True)
    show_blog = models.BooleanField(default=True)
    show_testimonials = models.BooleanField(default=True)
    show_contact = models.BooleanField(default=True)
    show_nav_about = models.BooleanField(default=True)
    show_nav_skills = models.BooleanField(default=True)
    show_nav_projects = models.BooleanField(default=True)
    show_nav_experience = models.BooleanField(default=True)
    show_nav_education = models.BooleanField(default=True)
    show_nav_activities = models.BooleanField(default=True)
    show_nav_achievements = models.BooleanField(default=True)
    show_nav_certifications = models.BooleanField(default=True)
    show_nav_blog = models.BooleanField(default=True)
    show_nav_testimonials = models.BooleanField(default=True)
    show_nav_contact = models.BooleanField(default=True)
    dashboard_section_order = models.JSONField(
        default=list,
        blank=True,
        help_text='Ordered dashboard section ids, e.g. ["portfolio_metrics", "quick_actions", "needs_attention"]',
    )
    is_platform_admin = models.BooleanField(default=False, help_text="Super admin flag — platform owner only")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"

    def __str__(self):
        return f"{self.full_name} (@{self.username_slug})"

    def save(self, *args, **kwargs):
        if not self.username_slug:
            self.username_slug = slugify(self.user.username)
        super().save(*args, **kwargs)


# ─── Skill Category (Per User) ─────────────────────────────────────────────

class SkillCategory(models.Model):
    """Dynamic categories for organizing skills — scoped to each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_categories')
    name = models.CharField(max_length=50)
    slug = models.SlugField(blank=True)
    order = models.IntegerField(default=0, help_text="Lower numbers appear first")

    class Meta:
        verbose_name = "Skill Category"
        verbose_name_plural = "Skill Categories"
        ordering = ['order', 'name']
        unique_together = ['user', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ─── Skill ──────────────────────────────────────────────────────────────────

class Skill(models.Model):
    """Individual skill linked to a dynamic category — scoped to each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=50)
    icon = models.URLField(blank=True, help_text="SVG or icon image URL")
    category = models.ForeignKey(
        SkillCategory,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} ({self.category.name})"


# ─── Project ───────────────────────────────────────────────────────────────

class Project(models.Model):
    """Portfolio project — scoped to each user."""

    CATEGORY_CHOICES = [
        ('fullstack', 'Full Stack'),
        ('backend', 'Backend'),
        ('frontend', 'Frontend'),
        ('automation', 'Automation'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    slug = models.SlugField(blank=True)
    thumbnail = models.URLField(blank=True, help_text="Cloudinary URL for cover image")
    description = models.TextField(blank=True, help_text="Detailed project description (supports markdown)")
    short_description = models.CharField(max_length=300, blank=True, help_text="One-liner for card view")
    tech_stack = models.ManyToManyField(Skill, blank=True, related_name='projects')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    live_url = models.URLField(blank=True, help_text="Deployed site URL")
    repo_url = models.URLField(blank=True, help_text="GitHub repository URL")
    is_featured = models.BooleanField(default=False, help_text="Show on hero section")
    is_visible = models.BooleanField(default=True, help_text="Toggle visibility without deleting")
    order = models.IntegerField(default=0, help_text="Lower numbers appear first")
    date_built = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-date_built']
        unique_together = ['user', 'slug']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


# ─── Experience ─────────────────────────────────────────────────────────────

class Experience(models.Model):
    """Professional experience timeline entry — scoped to each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='experiences')
    role = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    company_url = models.URLField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text="Leave blank for current position")
    is_current = models.BooleanField(default=False)
    highlights = models.JSONField(
        default=list,
        blank=True,
        help_text='List of achievements, e.g. ["Built X", "Led Y"]'
    )
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-start_date']
        verbose_name_plural = "Experiences"

    def __str__(self):
        return f"{self.role} at {self.company}"


# ─── Blog Post ─────────────────────────────────────────────────────────────

class Education(models.Model):
    """Academic education entry scoped to each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='educations')
    institution = models.CharField(max_length=140)
    degree = models.CharField(max_length=140)
    field_of_study = models.CharField(max_length=140, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    grade = models.CharField(max_length=80, blank=True, help_text="Optional GPA/score/class")
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-start_date', '-created_at']
        verbose_name_plural = "Education"

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Activity(models.Model):
    """Extracurricular activity entry scoped to each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=160)
    organization = models.CharField(max_length=140, blank=True)
    role = models.CharField(max_length=140, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    highlights = models.JSONField(
        default=list,
        blank=True,
        help_text='List of activity highlights, e.g. ["Led coding club", "Organized hackathon"]'
    )
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-start_date', '-created_at']
        verbose_name_plural = "Activities"

    def __str__(self):
        return self.title


class Achievement(models.Model):
    """Achievement or award entry scoped to each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=180)
    issuer = models.CharField(max_length=140, blank=True)
    achieved_on = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    proof_url = models.URLField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-achieved_on', '-created_at']

    def __str__(self):
        return self.title


class Certification(models.Model):
    """Certification entry scoped to each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=180)
    issuer = models.CharField(max_length=140, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=120, blank=True)
    credential_url = models.URLField(blank=True)
    skills = models.JSONField(
        default=list,
        blank=True,
        help_text='Optional tags, e.g. ["Python", "Cloud"]'
    )
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-issue_date', '-created_at']

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    """Blog posts — scoped to each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=200)
    slug = models.SlugField(blank=True)
    excerpt = models.TextField(max_length=500, help_text="Brief description for cards")
    content = models.TextField(help_text="Full article content (supports markdown)")
    thumbnail = models.URLField(blank=True, help_text="Cloudinary URL for cover image")
    tags = models.JSONField(default=list, blank=True, help_text='List of tags, e.g. ["React", "Django"]')
    read_time = models.CharField(max_length=20, default="5 min read")
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']
        unique_together = ['user', 'slug']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


# ─── Testimonial ───────────────────────────────────────────────────────────

class Testimonial(models.Model):
    """Client testimonials — scoped to each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='testimonials')
    client_name = models.CharField(max_length=100)
    client_role = models.CharField(max_length=100)
    client_company = models.CharField(max_length=100)
    client_avatar = models.URLField(blank=True, help_text="Cloudinary URL for client photo")
    content = models.TextField(help_text="Testimonial text")
    rating = models.IntegerField(default=5, help_text="Rating out of 5")
    project_name = models.CharField(max_length=100, blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.client_name} - {self.client_company}"


# ─── Message (Contact Form) ────────────────────────────────────────────────

class Message(models.Model):
    """Incoming messages from the contact form — scoped to each user."""
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    sender_name = models.CharField(max_length=100)
    sender_email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    honeypot = models.CharField(max_length=200, blank=True, help_text="Anti-spam hidden field")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"From {self.sender_name}: {self.subject or '(no subject)'}"

