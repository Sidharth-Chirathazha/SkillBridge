from rest_framework import serializers
from .models import Module,Course,Category

"""Serializer for Course Module"""
class ModuleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Module
        fields = ['title', 'description', 'video', 'duration', 'tasks', 'is_liked', 'likes_count', 'views_count']


"""Nested Serializer for Course and Module"""
class CourseSerializer(serializers.ModelSerializer):

    module = ModuleSerializer(many=True)

    class Meta:
        model = Course
        fields = ['tutor', 'category', 'slug', 'title', 'description', 'thumbnail', 
                  'total_enrollment', 'status', 'skill_level', 'price', 'is_active', 
                  'rating', 'modules']

    def create(self, validated_data):
        modules_data = validated_data.pop('modules')

        course = Course.objects.create(**validated_data)

        for data in modules_data:
            Module.objects.create(course=course, **data)

        return course
    
"""Serilaizer for category - Handles Crud operations for category"""
class CategorySerialzier(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active']
        read_only_fields = ['slug']