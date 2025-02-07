from rest_framework import serializers
from .models import Module,Course,Category, Review
from tutor.models import TutorProfile
from django.contrib.auth import get_user_model

User = get_user_model()

"""Serializer for Course Module"""
class ModuleSerializer(serializers.ModelSerializer):
    video = serializers.FileField(required=False)
    tasks = serializers.FileField(required=False)

    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'description', 'video', 'duration', 'tasks', 'is_liked', 'likes_count', 'views_count']

    def to_internal_value(self, data):

        if 'video' in data and isinstance(data['video'], str):
            del data['video']
        if 'tasks' in data and isinstance(data['tasks'], str):
            del data['tasks']
        return super().to_internal_value(data)
    

"""Creating a Tutor serializer specific to Course Serializer to include tutor name and tutor profile pic"""
class CourseTutorSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    profile_pic = serializers.ImageField(source="user.profile_pic_url", read_only=True)

    class Meta:
        model = TutorProfile
        fields = ['id', 'first_name', 'last_name', 'profile_pic']


"""Serializer for Course, Made the ModuleSerializer Read only field"""
class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    thumbnail = serializers.ImageField(required=False)
    tutor = CourseTutorSerializer(read_only=True)
    total_modules = serializers.IntegerField(read_only=True)
    total_duration = serializers.IntegerField(read_only=True)
    total_purchases = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'tutor', 'category', 'slug', 'title', 'description', 'thumbnail', 
                  'total_enrollment', 'status', 'skill_level', 'price', 'is_active', 
                  'rating', 'modules', 'total_modules', 'total_duration', 'total_purchases']

    
    
"""Serilaizer for category - Handles Crud operations for category"""
class CategorySerialzier(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active']
        read_only_fields = ['slug']

"""Serializer to include user first name and profile pic to the review"""
class ReviewUserSerializer(serializers.ModelSerializer):
    profile_pic_url = serializers.ImageField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'profile_pic_url']

"""Serialzer for reviews and ratings"""
class ReviewSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    user = ReviewUserSerializer(read_only=True)
    class Meta:
        model = Review
        fields = ['id','user', 'course', 'rating', 'review', 'created_at']
        read_only_fields = ['user', 'course', 'created_at']

    def create(self, validated_data):
        review = Review.objects.create(**validated_data)
        course = validated_data['course']
        course.update_rating()

        return review