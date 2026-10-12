from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Nearfix Administration"
admin.site.site_title = "Nearfix Admin"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("config.api_urls")),
]
