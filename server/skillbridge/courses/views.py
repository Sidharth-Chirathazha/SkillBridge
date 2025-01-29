from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from .serializers import CourseSerializer,CategorySerialzier
from .models import Category
from rest_framework.exceptions import ValidationError
from rest_framework.viewsets import ModelViewSet


class CourseCreationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

"""Handles the CRUD Operations for category"""
class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerialzier


    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if Category.objects.filter(name=request.data.get('name')).exists():
            raise ValidationError({"error": "Category with this name already exists."})
        return super().create(request, *args, **kwargs)


