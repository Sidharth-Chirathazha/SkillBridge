from rest_framework import serializers
from .models import TutorEducation,TutorProfile,TutorWorkExperience,TutorReview
from users.serializers import UserProfileSerializer
from users.models import Skill
from cloudinary.utils import cloudinary_url
from cloudinary.uploader import upload as cloudinary_upload
from django.contrib.auth import get_user_model

User = get_user_model()

class TutorEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorEducation
        fields = ['id', 'university', 'degree', 'year_of_passing']
        # read_only_fields = ['id']

class TutorWorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorWorkExperience
        fields = ['id', 'company', 'job_role', 'date_of_joining', 'date_of_leaving']
        # read_only_fields = ['id']

class TutorProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    resume_url = serializers.FileField()
    educations = TutorEducationSerializer(many=True, required=False)
    work_experiences = TutorWorkExperienceSerializer(many=True, required=False)

    class Meta:
        model = TutorProfile
        fields = ['id', 'user', 'resume_url', 'rating', 'is_verified','cur_job_role',
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


        for field, value in user_data.items():
            if field != 'skills' and field != 'profile_pic_url':
                setattr(user_instance, field, value)
        user_instance.save()


        if 'profile_pic_url' in user_data:
            profile_pic = user_data.pop('profile_pic_url')
            print("Inside pro if serializer:", profile_pic)
            user_instance.profile_pic_url = profile_pic
            user_instance.save()


        skill_ids = user_data.get('skills', [])
        if skill_ids:
            skill_ids = [skill.id if hasattr(skill, 'id') else skill for skill in skill_ids]
            user_instance.skills.set(Skill.objects.filter(id__in=skill_ids))


        if resume:
             print("Inside resume in serialzier",resume )
             cloudinary_response = cloudinary_upload(resume)
             instance.resume_url = cloudinary_response.get('public_id')
        
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        education_ids = [edu['id'] for edu in educations_data if 'id' in edu]
        TutorEducation.objects.filter(tutor_profile=instance).exclude(id__in=education_ids).delete()

        TutorEducation.objects.bulk_create([
            TutorEducation(tutor_profile=instance, **edu) for edu in educations_data
        ], ignore_conflicts=True) 
        

        work_ids = [exp['id'] for exp in work_experiences_data if 'id' in exp]
        TutorWorkExperience.objects.filter(tutor_profile=instance).exclude(id__in=work_ids).delete()
        
        TutorWorkExperience.objects.bulk_create([
            TutorWorkExperience(tutor_profile=instance, **exp) for exp in work_experiences_data 
        ], ignore_conflicts=True)

        # # Update Social Media Profiles
        # for social in social_media_data:
        #     SocialMediaPlatform.objects.create(tutor_profile=instance, **social)

        instance.save()

        return instance
    
class TutorReviewUserSerializer(serializers.ModelSerializer):
    profile_pic_url = serializers.ImageField(read_only=True)
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'profile_pic_url', 'full_name']

class TutorReviewSerializer(serializers.ModelSerializer):
    user = TutorReviewUserSerializer(read_only=True)
    tutor = serializers.PrimaryKeyRelatedField(queryset=TutorProfile.objects.all())

    class Meta:
        model = TutorReview
        fields = ['id','user', 'tutor', 'rating', 'review', 'created_at']
        read_only_fields = ['user', 'tutor', 'created_at']

    def create(self, validated_data):
        review = TutorReview.objects.create(**validated_data)
        tutor = validated_data['tutor']
        tutor.update_rating()

        return review