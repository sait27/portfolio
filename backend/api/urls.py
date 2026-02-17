from django.urls import path
from . import views

urlpatterns = [
    # ── Public Endpoints ──────────────────────────────────────────────────
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('skills/', views.SkillListView.as_view(), name='skill-list'),
    path('skill-categories/', views.SkillCategoryListView.as_view(), name='skill-category-list'),
    path('projects/', views.ProjectListView.as_view(), name='project-list'),
    path('projects/<slug:slug>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('experience/', views.ExperienceListView.as_view(), name='experience-list'),
    path('contact/', views.ContactCreateView.as_view(), name='contact-create'),
]
