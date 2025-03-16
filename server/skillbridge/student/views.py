from django.shortcuts import render
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.exceptions import ValidationError
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

        courses_enrolled = Purchase.objects.filter(user=user).count()
        courses_completed = Purchase.objects.filter(user=user, completed=True).count()
        
        completed_percentage = (courses_completed/courses_enrolled) * 100 if courses_enrolled else 0
        remaining_percentage = 100 - completed_percentage

        # Convert total_time_spent from seconds to hh:mm:ss format
        total_seconds = user.total_time_spent or 0
        formatted_time = str(timedelta(seconds=total_seconds))

        return Response({
            "courses_enrolled": courses_enrolled,
            "courses_completed": courses_completed,
            "completed_percentage": round(completed_percentage, 2),
            "remaining_percentage": round(remaining_percentage, 2),
            "learning_time_seconds": total_seconds,
            "learning_time_formatted": formatted_time
        })


class TopRatedCoursesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        top_courses = Course.objects.all().order_by('-rating')[:3]  # Order by highest-rated courses
        serializer = TopRatedCoursesSerializer(top_courses, many=True)
        return Response(serializer.data)

class TopRatedTutorsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        top_tutors = TutorProfile.objects.all().order_by('-rating')[:3]  # Order by highest-rated tutors
        serializer = TopRatedTutorsSerializer(top_tutors, many=True)
        return Response(serializer.data)