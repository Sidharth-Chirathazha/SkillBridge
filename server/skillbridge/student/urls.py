from django.urls import path,include
from .views import StudentDashboardSummaryAPIView, TopRatedCoursesAPIView, TopRatedTutorsAPIView


urlpatterns = [
    path('dashboard-summary/', StudentDashboardSummaryAPIView.as_view(), name='dashboard_summary'),
    path('top-rated-courses/', TopRatedCoursesAPIView.as_view(), name='top_rated_courses'),
    path('top-rated-tutors/', TopRatedTutorsAPIView.as_view(), name='top_rated_tutors'),
]