from django.db import models
from django.utils.text import slugify


# ─── Profile (Singleton) ───────────────────────────────────────────────────

class Profile(models.Model):
    """Single-row model for the portfolio owner's info."""
    full_name = models.CharField(max_length=100)
    tagline = models.CharField(max_length=200, help_text="e.g., Full-Stack Python Developer")
    bio = models.TextField()
    avatar = models.URLField(blank=True, help_text="Cloudinary URL for profile photo")
    resume = models.URLField(blank=True, help_text="Cloudinary URL for resume PDF")
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profile"

    def __str__(self):
        return self.full_name

    def save(self, *args, **kwargs):
        """Enforce singleton — only one Profile row allowed."""
        if not self.pk and Profile.objects.exists():
            raise ValueError("Only one Profile instance is allowed. Edit the existing one.")
        super().save(*args, **kwargs)


# ─── Skill Category (Dynamic, Admin-Controlled) ────────────────────────────

class SkillCategory(models.Model):
    """Dynamic categories for organizing skills (e.g., Backend, AI Models, IDEs)."""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    order = models.IntegerField(default=0, help_text="Lower numbers appear first")

    class Meta:
        verbose_name = "Skill Category"
        verbose_name_plural = "Skill Categories"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ─── Skill ──────────────────────────────────────────────────────────────────

class Skill(models.Model):
    """Individual skill linked to a dynamic category."""
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
    """Portfolio project with full metadata."""

    CATEGORY_CHOICES = [
        ('fullstack', 'Full Stack'),
        ('backend', 'Backend'),
        ('frontend', 'Frontend'),
        ('automation', 'Automation'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    thumbnail = models.URLField(help_text="Cloudinary URL for cover image")
    description = models.TextField(help_text="Detailed project description (supports markdown)")
    short_description = models.CharField(max_length=300, help_text="One-liner for card view")
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

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


# ─── Experience ─────────────────────────────────────────────────────────────

class Experience(models.Model):
    """Professional experience timeline entry."""
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


# ─── Message (Contact Form) ────────────────────────────────────────────────

class Message(models.Model):
    """Incoming messages from the contact form."""
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
