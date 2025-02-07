from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import TutorReviewViewSet

router = DefaultRouter()
router.register(r'tutor-reviews', TutorReviewViewSet, basename='tutor-reviews')

urlpatterns = [
    path('', include(router.urls)),
]