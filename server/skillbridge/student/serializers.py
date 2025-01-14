from rest_framework import serializers
from .models import StudentProfile
from socialmedia.serializers import SocialMediaPlatformSerializer
from socialmedia.models import SocialMediaPlatform
from users.serializers import UserProfileSerializer



class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    social_media_platforms = SocialMediaPlatformSerializer(many=True, required=False)
    class Meta:
        model = StudentProfile
        fields = ['user', 'social_media_profiles']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user',{})
        social_media_data = validated_data.pop('social_media_profiles',[])

        # Update User fields
        for field,value in user_data.items():
            setattr(instance.user, field, value)
        instance.user.save()

        # Update Social Media Profiles
        for social in social_media_data:
            SocialMediaPlatform.objects.create(student_profile=instance, **social)

        return instance
