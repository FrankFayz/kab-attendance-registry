from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from reporting import services


class MarkAbsencesView(APIView):
    def post(self, request):
        try:
            result = services.mark_absences(request.data.get("date"))
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_200_OK)


class AttendanceHealthView(APIView):
    def get(self, request):
        return Response(services.attendance_health())


class ChronicAbsencesView(APIView):
    def get(self, request):
        return Response(services.chronic_absences())


class AbsenceStreaksView(APIView):
    def get(self, request):
        return Response(services.absence_streaks())


class ReportingDashboardView(APIView):
    def get(self, request):
        return Response(services.dashboard())
