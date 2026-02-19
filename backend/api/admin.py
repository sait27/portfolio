from django.contrib import admin
from .models import Profile, SkillCategory, Skill, Project, Experience, Message


# ─── Profile ────────────────────────────────────────────────────────────────

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'username_slug', 'user', 'is_platform_admin', 'updated_at')
    list_filter = ('is_platform_admin',)
    search_fields = ('full_name', 'username_slug', 'email')
    fieldsets = (
        ('User', {
            'fields': ('user', 'username_slug', 'is_platform_admin')
        }),
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


# ─── Skill Category ────────────────────────────────────────────────────────

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'slug', 'order', 'skill_count')
    list_filter = ('user',)
    list_editable = ('order',)
    prepopulated_fields = {'slug': ('name',)}

    def skill_count(self, obj):
        return obj.skills.count()
    skill_count.short_description = 'Skills'


# ─── Skill ──────────────────────────────────────────────────────────────────

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'order', 'created_at')
    list_filter = ('user', 'category')
    list_editable = ('order',)
    search_fields = ('name',)


# ─── Project ───────────────────────────────────────────────────────────────

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'is_featured', 'is_visible', 'order')
    list_filter = ('user', 'category', 'is_featured', 'is_visible')
    list_editable = ('is_featured', 'is_visible', 'order')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tech_stack',)


# ─── Experience ─────────────────────────────────────────────────────────────

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'company', 'user', 'start_date', 'is_current', 'order')
    list_filter = ('user', 'is_current')
    list_editable = ('is_current', 'order')


# ─── Message ───────────────────────────────────────────────────────────────

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender_name', 'recipient', 'subject', 'is_read', 'created_at')
    list_filter = ('recipient', 'is_read')
    list_editable = ('is_read',)
    search_fields = ('sender_name', 'sender_email', 'subject')
    readonly_fields = ('sender_name', 'sender_email', 'subject', 'content', 'honeypot', 'created_at')

    def has_add_permission(self, request):
        return False
