from rest_framework import serializers
from .models import TutorEducation,TutorProfile,TutorWorkExperience
from users.serializers import UserProfileSerializer
from users.models import Skill
from cloudinary.utils import cloudinary_url
from cloudinary.uploader import upload as cloudinary_upload


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
    resume_url = serializers.SerializerMethodField()
    educations = TutorEducationSerializer(many=True, required=False)
    work_experiences = TutorWorkExperienceSerializer(many=True, required=False)
    # social_media_profiles = SocialMediaPlatformSerializer(many=True, required=False)

    class Meta:
        model = TutorProfile
        fields = ['user', 'resume_url', 'rating', 'is_verified','cur_job_role',
            'educations', 'work_experiences']
        read_only_fields = ['is_verified', 'rating']

    def get_resume_url(self, obj):
        if obj.resume_url:
            public_id = str(obj.resume_url)
            return cloudinary_url(public_id)[0]
        return None
        

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user',{})
        educations_data = validated_data.pop('educations', [])
        work_experiences_data = validated_data.pop('work_experiences', [])
        # social_media_data = validated_data.pop('social_media_profiles', [])
        resume = validated_data.pop('resume_url', None)

        # print("Inside tutor serializer:",user_data['profile_pic_url'])
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


        if resume:
             # Upload the image to Cloudinary and get the public_id
             cloudinary_response = cloudinary_upload(resume)
             instance.resume_url = cloudinary_response.get('public_id')
        
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        # Update educations
        for edu in educations_data:
            TutorEducation.objects.update_or_create(tutor_profile=instance, **edu)
        
        # Update work experiences
        for work in work_experiences_data:
            TutorWorkExperience.objects.update_or_create(tutor_profile=instance, **work)

        # # Update Social Media Profiles
        # for social in social_media_data:
        #     SocialMediaPlatform.objects.create(tutor_profile=instance, **social)

        instance.save()

        return instance