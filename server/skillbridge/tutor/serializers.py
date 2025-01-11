from rest_framework import serializers
from .models import TutorEducation,TutorProfile,TutorWorkExperience


class TutorEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorEducation
        fields = ['id', 'university', 'degree', 'year_of_passing']

class TutorWorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorWorkExperience
        fields = ['id', 'company', 'job_role', 'date_of_joining', 'date_of_leaving']

class TutorProfileSerializer(serializers.ModelSerializer):
    educations = TutorEducationSerializer(many=True)
    work_experiences = TutorWorkExperienceSerializer(many=True)

    class Meta:
        model = TutorProfile
        fields = ['resume_url', 'rating', 'is_verified', 'educations', 'work_experiences']
        read_only_fields = ['is_verified', 'rating']

    def update(self, instance, validated_data):
        educations_data = validated_data.pop('educations', [])
        work_experiences_data = validated_data.pop('work_experiences', [])

        # Update educations
        for edu_data in educations_data:
            TutorEducation.objects.update_or_create(
                tutor_profile = instance, id=edu_data.get('id'), defaults=edu_data
            )
        
        # Update work experiences
        for work_data in work_experiences_data:
            TutorWorkExperience.objects.update_or_create(
                tutor_profile = instance, id=work_data.get('id'), defaults=work_data
            )

        return super().update(instance, validated_data)