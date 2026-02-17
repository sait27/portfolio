from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Customize admin site header
admin.site.site_header = "Portfolio Admin"
admin.site.site_title = "Portfolio CMS"
admin.site.index_title = "Content Management"
