from django.urls import path

from reporting import views

urlpatterns = [
    path("mark-absences/", views.MarkAbsencesView.as_view(), name="mark-absences"),
    path("health/", views.AttendanceHealthView.as_view(), name="attendance-health"),
    path("chronic/", views.ChronicAbsencesView.as_view(), name="chronic-absences"),
    path("streaks/", views.AbsenceStreaksView.as_view(), name="absence-streaks"),
    path("dashboard/", views.ReportingDashboardView.as_view(), name="reporting-dashboard"),
]
