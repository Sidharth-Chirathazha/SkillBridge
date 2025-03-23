from rest_framework import serializers
from .models import StudentProfile
from users.serializers import UserProfileSerializer
from users.models import Skill
from tutor.models import TutorProfile
from courses.models import Course, Purchase
from django.db.models import Count


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()

    class Meta:
        model = StudentProfile
        fields = ['user']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user',{})
       

        user_instance = instance.user

        #Update User fields
        for field, value in user_data.items():
            if field != 'skills' and field != 'profile_pic_url':
                setattr(user_instance, field, value)
        user_instance.save()

        if 'profile_pic_url' in user_data:
            profile_pic = user_data.pop('profile_pic_url')
            user_instance.profile_pic_url = profile_pic
            user_instance.save()

        skill_ids = user_data.get('skills', [])
        if skill_ids:
            skill_ids = [skill.id if hasattr(skill, 'id') else skill for skill in skill_ids]
            user_instance.skills.set(Skill.objects.filter(id__in=skill_ids))
        else:
            user_instance.skills.clear()

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        return instance
    
class TopRatedCoursesSerializer(serializers.ModelSerializer):
    tutor_name = serializers.CharField(source="tutor.user.get_full_name", read_only=True)
    total_reviews = serializers.SerializerMethodField()
    thumbnail = serializers.ImageField(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'thumbnail', 'tutor_name', 'rating', 'total_reviews']

    def get_total_reviews(self, obj):
        return obj.reviews.count()
    
class TopRatedTutorsSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()
    name = serializers.CharField(source="user.get_full_name", read_only=True)
    city = serializers.CharField(source="user.city", read_only=True)
    total_students = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField() 

    class Meta:
        model = TutorProfile
        fields = ['id', 'name', 'profile_pic', 'rating', 'total_students', 'city']

    def get_profile_pic(self, obj):
        return obj.user.profile_pic_url.url if obj.user.profile_pic_url else None

    def get_total_students(self, obj):

        return (
            Purchase.objects.filter(course__tutor=obj)
            .values("user")
            .distinct()
            .count()
            )
    
    def get_rating(self, obj):
        return round(obj.rating, 1) if obj.rating is not None else 0.0
