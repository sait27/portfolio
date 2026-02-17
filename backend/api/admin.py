from django.contrib import admin
from .models import Profile, SkillCategory, Skill, Project, Experience, Message


# ─── Profile ────────────────────────────────────────────────────────────────

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'tagline', 'email', 'updated_at')
    fieldsets = (
        ('Personal Info', {
            'fields': ('full_name', 'tagline', 'bio', 'email')
        }),
        ('Media', {
            'fields': ('avatar', 'resume')
        }),
        ('Social Links', {
            'fields': ('github_url', 'linkedin_url', 'twitter_url')
        }),
    )

    def has_add_permission(self, request):
        """Prevent creating more than one Profile."""
        if Profile.objects.exists():
            return False
        return super().has_add_permission(request)


# ─── Skill Category ────────────────────────────────────────────────────────

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', 'skill_count')
    list_editable = ('order',)
    prepopulated_fields = {'slug': ('name',)}

    def skill_count(self, obj):
        return obj.skills.count()
    skill_count.short_description = 'Skills'


# ─── Skill ──────────────────────────────────────────────────────────────────

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'order', 'created_at')
    list_filter = ('category',)
    list_editable = ('order',)
    search_fields = ('name',)


# ─── Project ───────────────────────────────────────────────────────────────

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_featured', 'is_visible', 'order', 'date_built')
    list_filter = ('category', 'is_featured', 'is_visible')
    list_editable = ('is_featured', 'is_visible', 'order')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tech_stack',)
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'slug', 'short_description', 'description', 'category', 'date_built')
        }),
        ('Media & Links', {
            'fields': ('thumbnail', 'live_url', 'repo_url')
        }),
        ('Tech Stack', {
            'fields': ('tech_stack',)
        }),
        ('Display Options', {
            'fields': ('is_featured', 'is_visible', 'order')
        }),
    )


# ─── Experience ─────────────────────────────────────────────────────────────

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'company', 'start_date', 'end_date', 'is_current', 'order')
    list_editable = ('is_current', 'order')
    list_filter = ('is_current',)


# ─── Message ───────────────────────────────────────────────────────────────

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender_name', 'sender_email', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read',)
    list_editable = ('is_read',)
    search_fields = ('sender_name', 'sender_email', 'subject', 'content')
    readonly_fields = ('sender_name', 'sender_email', 'subject', 'content', 'honeypot', 'created_at')

    def has_add_permission(self, request):
        """Messages are created via API only, not admin."""
        return False
