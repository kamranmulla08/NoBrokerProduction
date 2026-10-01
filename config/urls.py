
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve


urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # API
    path("api/users/", include("apps.users.urls")),
    path("api/properties/", include("apps.properties.urls")),
    path("api/deals/", include("apps.deals.urls")),
    path("api/chat/", include("apps.chat.urls")),

    re_path(
        r"^media/(?P<path>.*)$",
        serve,
        {"document_root": settings.MEDIA_ROOT},
    ),
]
