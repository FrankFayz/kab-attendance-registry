from django.urls import path

from roster import views

urlpatterns = [
    path("students/", views.StudentListCreateView.as_view(), name="students"),
    path("check-in/", views.CheckInView.as_view(), name="check-in"),
    path("check-ins/today/", views.TodayCheckInSummaryView.as_view(), name="today-check-ins"),
]
