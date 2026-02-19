from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from . import admin_views
from . import auth_views

urlpatterns = [
    # ── Auth ─────────────────────────────────────────────────────────────
    path('auth/register/', auth_views.RegisterView.as_view(), name='auth-register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', auth_views.MeView.as_view(), name='auth-me'),
    path('auth/forgot-password/', auth_views.ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('auth/reset-password/', auth_views.ResetPasswordView.as_view(), name='auth-reset-password'),
    path('auth/change-password/', auth_views.ChangePasswordView.as_view(), name='auth-change-password'),

    # ── Public Portfolio Endpoints (by username) ─────────────────────────
    path('u/<str:username>/profile/', views.PublicProfileView.as_view(), name='public-profile'),
    path('u/<str:username>/skills/', views.PublicSkillListView.as_view(), name='public-skills'),
    path('u/<str:username>/projects/', views.PublicProjectListView.as_view(), name='public-projects'),
    path('u/<str:username>/projects/<slug:slug>/', views.PublicProjectDetailView.as_view(), name='public-project-detail'),
    path('u/<str:username>/experience/', views.PublicExperienceListView.as_view(), name='public-experience'),
    path('u/<str:username>/contact/', views.PublicContactView.as_view(), name='public-contact'),

    # ── Dashboard (authenticated user's own data) ────────────────────────
    path('dashboard/stats/', admin_views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/profile/', admin_views.DashboardProfileView.as_view(), name='dashboard-profile'),

    path('dashboard/projects/', admin_views.DashboardProjectListCreateView.as_view(), name='dashboard-projects'),
    path('dashboard/projects/<int:pk>/', admin_views.DashboardProjectDetailView.as_view(), name='dashboard-project-detail'),

    path('dashboard/skills/', admin_views.DashboardSkillListCreateView.as_view(), name='dashboard-skills'),
    path('dashboard/skills/<int:pk>/', admin_views.DashboardSkillDetailView.as_view(), name='dashboard-skill-detail'),

    path('dashboard/skill-categories/', admin_views.DashboardCategoryListCreateView.as_view(), name='dashboard-categories'),
    path('dashboard/skill-categories/<int:pk>/', admin_views.DashboardCategoryDetailView.as_view(), name='dashboard-category-detail'),

    path('dashboard/experience/', admin_views.DashboardExperienceListCreateView.as_view(), name='dashboard-experience'),
    path('dashboard/experience/<int:pk>/', admin_views.DashboardExperienceDetailView.as_view(), name='dashboard-experience-detail'),

    path('dashboard/messages/', admin_views.DashboardMessageListView.as_view(), name='dashboard-messages'),
    path('dashboard/messages/<int:pk>/', admin_views.DashboardMessageDetailView.as_view(), name='dashboard-message-detail'),

    path('dashboard/upload/', admin_views.DashboardUploadView.as_view(), name='dashboard-upload'),
]
