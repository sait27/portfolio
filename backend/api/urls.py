from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from . import admin_views
from . import auth_views
from . import superadmin_views

urlpatterns = [
    # ── Auth ─────────────────────────────────────────────────────────────
    path('auth/register/', auth_views.RegisterView.as_view(), name='auth-register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', auth_views.MeView.as_view(), name='auth-me'),
    path('auth/forgot-password/', auth_views.ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('auth/reset-password/', auth_views.ResetPasswordView.as_view(), name='auth-reset-password'),
    path('auth/change-password/', auth_views.ChangePasswordView.as_view(), name='auth-change-password'),

    # ── Admin (platform owner only) ─────────────────────────────────
    path('admin/stats/', superadmin_views.SuperAdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', superadmin_views.SuperAdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', superadmin_views.SuperAdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/impersonate/<int:user_id>/', superadmin_views.ImpersonateUserView.as_view(), name='admin-impersonate'),
    path('admin/stop-impersonation/', superadmin_views.StopImpersonationView.as_view(), name='admin-stop-impersonation'),

    # ── Public Portfolio Endpoints (by username) ─────────────────────────
    path('u/<str:username>/profile/', views.PublicProfileView.as_view(), name='public-profile'),
    path('u/<str:username>/skills/', views.PublicSkillListView.as_view(), name='public-skills'),
    path('u/<str:username>/projects/', views.PublicProjectListView.as_view(), name='public-projects'),
    path('u/<str:username>/projects/<slug:slug>/', views.PublicProjectDetailView.as_view(), name='public-project-detail'),
    path('u/<str:username>/experience/', views.PublicExperienceListView.as_view(), name='public-experience'),
    path('u/<str:username>/contact/', views.PublicContactView.as_view(), name='public-contact'),
    path('u/<str:username>/blog/', views.PublicBlogListView.as_view(), name='public-blog'),
    path('u/<str:username>/blog/<slug:slug>/', views.PublicBlogDetailView.as_view(), name='public-blog-detail'),
    path('u/<str:username>/testimonials/', views.PublicTestimonialListView.as_view(), name='public-testimonials'),

    # ── User Dashboard (authenticated user's own data) ────────────────────────
    path('user/stats/', admin_views.DashboardStatsView.as_view(), name='user-stats'),
    path('user/profile/', admin_views.DashboardProfileView.as_view(), name='user-profile'),

    path('user/projects/', admin_views.DashboardProjectListCreateView.as_view(), name='user-projects'),
    path('user/projects/<int:pk>/', admin_views.DashboardProjectDetailView.as_view(), name='user-project-detail'),

    path('user/skills/', admin_views.DashboardSkillListCreateView.as_view(), name='user-skills'),
    path('user/skills/<int:pk>/', admin_views.DashboardSkillDetailView.as_view(), name='user-skill-detail'),

    path('user/skill-categories/', admin_views.DashboardCategoryListCreateView.as_view(), name='user-categories'),
    path('user/skill-categories/<int:pk>/', admin_views.DashboardCategoryDetailView.as_view(), name='user-category-detail'),

    path('user/experience/', admin_views.DashboardExperienceListCreateView.as_view(), name='user-experience'),
    path('user/experience/<int:pk>/', admin_views.DashboardExperienceDetailView.as_view(), name='user-experience-detail'),

    path('user/messages/', admin_views.DashboardMessageListView.as_view(), name='user-messages'),
    path('user/messages/<int:pk>/', admin_views.DashboardMessageDetailView.as_view(), name='user-message-detail'),

    path('user/upload/', admin_views.DashboardUploadView.as_view(), name='user-upload'),

    path('user/blog/', admin_views.DashboardBlogListCreateView.as_view(), name='user-blog'),
    path('user/blog/<int:pk>/', admin_views.DashboardBlogDetailView.as_view(), name='user-blog-detail'),

    path('user/testimonials/', admin_views.DashboardTestimonialListCreateView.as_view(), name='user-testimonials'),
    path('user/testimonials/<int:pk>/', admin_views.DashboardTestimonialDetailView.as_view(), name='user-testimonial-detail'),

    # ── Dashboard (backward compatibility) ────────────────────────────
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

    path('dashboard/blog/', admin_views.DashboardBlogListCreateView.as_view(), name='dashboard-blog'),
    path('dashboard/blog/<int:pk>/', admin_views.DashboardBlogDetailView.as_view(), name='dashboard-blog-detail'),

    path('dashboard/testimonials/', admin_views.DashboardTestimonialListCreateView.as_view(), name='dashboard-testimonials'),
    path('dashboard/testimonials/<int:pk>/', admin_views.DashboardTestimonialDetailView.as_view(), name='dashboard-testimonial-detail'),
]
