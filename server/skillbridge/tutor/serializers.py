from rest_framework import serializers
from .models import TutorEducation,TutorProfile,TutorWorkExperience
from socialmedia.serializers import SocialMediaPlatformSerializer
from users.serializers import UserProfileSerializer,Skill
from socialmedia.models import SocialMediaPlatform


class TutorEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorEducation
        fields = ['university', 'degree', 'year_of_passing']

class TutorWorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorWorkExperience
        fields = ['company', 'job_role', 'date_of_joining', 'date_of_leaving']

class TutorProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    educations = TutorEducationSerializer(many=True, required=True)
    work_experiences = TutorWorkExperienceSerializer(many=True, required=True)
    social_media_profiles = SocialMediaPlatformSerializer(many=True, required=False)

    class Meta:
        model = TutorProfile
        fields = ['user', 'resume_url', 'rating', 'is_verified', 
            'educations', 'work_experiences', 'social_media_profiles']
        read_only_fields = ['is_verified', 'rating']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user',{})
        educations_data = validated_data.pop('educations', [])
        work_experiences_data = validated_data.pop('work_experiences', [])
        social_media_data = validated_data.pop('social_media_profiles', [])

        # Update Skills
        skill_ids = user_data.get('skills', [])
        if skill_ids:
            skill_ids = [skill.id if hasattr(skill, 'id') else skill for skill in skill_ids]
            instance.user.skills.set(Skill.objects.filter(id__in=skill_ids))

        #Update User fields
        for field, value in user_data.items():
            if field != 'skills':
                setattr(instance.user, field, value)
        instance.user.save()

        # Update educations
        for edu in educations_data:
            TutorEducation.objects.update_or_create(tutor_profile=instance, **edu)
        
        # Update work experiences
        for work in work_experiences_data:
            TutorWorkExperience.objects.update_or_create(tutor_profile=instance, **work)

        # Update Social Media Profiles
        for social in social_media_data:
            SocialMediaPlatform.objects.create(tutor_profile=instance, **social)

        return instance