from rest_framework import serializers
from .models import StudentProfile
from users.serializers import UserProfileSerializer
from users.models import Skill



class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    # social_media_platforms = SocialMediaPlatformSerializer(many=True, required=False)
    class Meta:
        model = StudentProfile
        fields = ['user']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user',{})
        # social_media_data = validated_data.pop('social_media_profiles',[])

        user_instance = instance.user

        #Update User fields
        for field, value in user_data.items():
            if field != 'skills' and field != 'profile_pic_url':
                setattr(user_instance, field, value)
        user_instance.save()

        # If the profile_pic_url is provided, save it separately to Cloudinary
        if 'profile_pic_url' in user_data:
            profile_pic = user_data.pop('profile_pic_url')
            print("Inside pro if serializer:", profile_pic)
            user_instance.profile_pic_url = profile_pic
            user_instance.save()

        # Update Skills
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
