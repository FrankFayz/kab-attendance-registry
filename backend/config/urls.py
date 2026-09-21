from django.urls import include, path

from reporting.urls import urlpatterns as reporting_urls
from roster.urls import urlpatterns as roster_urls

urlpatterns = [
    path("api/", include(roster_urls + reporting_urls)),
]
