from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommunityViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'communities', CommunityViewSet, basename='community')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]
