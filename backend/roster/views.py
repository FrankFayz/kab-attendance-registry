from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from roster import services


class StudentListCreateView(APIView):
    def get(self, request):
        return Response({"students": services.list_students()})

    def post(self, request):
        try:
            student = services.create_student(
                request.data.get("name"),
                request.data.get("student_id"),
            )
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(student, status=status.HTTP_201_CREATED)


class CheckInView(APIView):
    def post(self, request):
        try:
            result = services.check_in(
                request.data.get("student_id"),
                request.data.get("status"),
            )
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)


class TodayCheckInSummaryView(APIView):
    def get(self, request):
        return Response(services.today_check_ins())
