from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet

"""Created a router and resgistered the CategoryViewSet"""
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]