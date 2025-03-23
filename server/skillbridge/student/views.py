from django.shortcuts import render
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework import status
from django.db.models import Count, Q
from django.db import DatabaseError
from rest_framework.views import APIView
from rest_framework.response import Response
from courses.models import Purchase
from django.contrib.auth import get_user_model
from datetime import timedelta
from courses.models import Course
from tutor.models import TutorProfile
from .serializers import TopRatedTutorsSerializer, TopRatedCoursesSerializer


# Create your views here.


class StudentDashboardSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        try:

            course_summary = Purchase.objects.filter(user=user).aggregate(
                courses_enrolled = Count("id"),
                courses_completed = Count("id", filter=Q(completed=True))
            )

            courses_enrolled = course_summary["courses_enrolled"]
            courses_completed = course_summary["courses_completed"]
            
            completed_percentage = (courses_completed/courses_enrolled) * 100 if courses_enrolled else 0

            # Convert total_time_spent from seconds to hh:mm:ss format
            total_seconds = int(user.total_time_spent or 0)
            formatted_time = str(timedelta(seconds=total_seconds))

            return Response({
                "courses_enrolled": courses_enrolled,
                "courses_completed": courses_completed,
                "completed_percentage": round(completed_percentage, 2),
                "learning_time_seconds": total_seconds,
                "learning_time_formatted": formatted_time
            })
        except DatabaseError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TopRatedCoursesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            top_courses = Course.objects.all().order_by('-rating')[:3]  # Order by highest-rated courses
            serializer = TopRatedCoursesSerializer(top_courses, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class TopRatedTutorsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            top_tutors = TutorProfile.objects.all().order_by('-rating')[:3]  # Order by highest-rated tutors
            serializer = TopRatedTutorsSerializer(top_tutors, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)