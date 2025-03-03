from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommunityViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'communities', CommunityViewSet)
router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
