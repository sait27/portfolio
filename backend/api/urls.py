from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from . import admin_views

urlpatterns = [
    # ── Public Endpoints ──────────────────────────────────────────────────
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('skills/', views.SkillListView.as_view(), name='skill-list'),
    path('skill-categories/', views.SkillCategoryListView.as_view(), name='skill-category-list'),
    path('projects/', views.ProjectListView.as_view(), name='project-list'),
    path('projects/<slug:slug>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('experience/', views.ExperienceListView.as_view(), name='experience-list'),
    path('contact/', views.ContactCreateView.as_view(), name='contact-create'),

    # ── JWT Auth ──────────────────────────────────────────────────────────
    path('auth/token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # ── Admin Dashboard ──────────────────────────────────────────────────
    path('admin/dashboard/', admin_views.AdminDashboardView.as_view(), name='admin-dashboard'),

    # ── Admin Profile ────────────────────────────────────────────────────
    path('admin/profile/', admin_views.AdminProfileView.as_view(), name='admin-profile'),

    # ── Admin Projects CRUD ──────────────────────────────────────────────
    path('admin/projects/', admin_views.AdminProjectListCreateView.as_view(), name='admin-project-list'),
    path('admin/projects/<int:pk>/', admin_views.AdminProjectDetailView.as_view(), name='admin-project-detail'),

    # ── Admin Skills CRUD ────────────────────────────────────────────────
    path('admin/skills/', admin_views.AdminSkillListCreateView.as_view(), name='admin-skill-list'),
    path('admin/skills/<int:pk>/', admin_views.AdminSkillDetailView.as_view(), name='admin-skill-detail'),

    # ── Admin Skill Categories CRUD ──────────────────────────────────────
    path('admin/skill-categories/', admin_views.AdminSkillCategoryListCreateView.as_view(), name='admin-category-list'),
    path('admin/skill-categories/<int:pk>/', admin_views.AdminSkillCategoryDetailView.as_view(), name='admin-category-detail'),

    # ── Admin Experience CRUD ────────────────────────────────────────────
    path('admin/experience/', admin_views.AdminExperienceListCreateView.as_view(), name='admin-experience-list'),
    path('admin/experience/<int:pk>/', admin_views.AdminExperienceDetailView.as_view(), name='admin-experience-detail'),

    # ── Admin Messages ───────────────────────────────────────────────────
    path('admin/messages/', admin_views.AdminMessageListView.as_view(), name='admin-message-list'),
    path('admin/messages/<int:pk>/', admin_views.AdminMessageDetailView.as_view(), name='admin-message-detail'),

    # ── Admin Upload ─────────────────────────────────────────────────────
    path('admin/upload/', admin_views.AdminUploadView.as_view(), name='admin-upload'),
]
