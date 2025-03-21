from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User
from courses.models import Purchase


class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self,data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(request=self.context.get('request'),email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid Credentials")
        if not user.is_superuser:
            raise serializers.ValidationError("You do not have admin privileges.")
        
        refresh = RefreshToken.for_user(user)
        return{
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

class AdminTutorSerializer(serializers.ModelSerializer):

   # Fields from User
    skills = serializers.StringRelatedField(many=True)
    profile_pic_url = serializers.CharField(source="profile_pic_url.url", allow_null=True)
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    # Fields from TutorProfile
    tutor_id = serializers.IntegerField(source="tutor_profile.id")
    resume_url = serializers.CharField(source="tutor_profile.resume_url.url", allow_null=True)
    rating = serializers.SerializerMethodField()
    is_verified = serializers.BooleanField(source="tutor_profile.is_verified")
    cur_job_role = serializers.CharField(source="tutor_profile.cur_job_role")

    total_courses = serializers.SerializerMethodField()
    total_students = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    # Related fields
    educations = serializers.SerializerMethodField()
    work_experiences = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "tutor_id",
            "full_name",
            "email",
            "phone",
            "is_active",
            "created_at",
            "updated_at",
            "skills",
            "profile_pic_url",  # Directly included if already storing as URL
            "linkedin_url",
            "bio",
            "country",
            "city",
            "resume_url",
            "rating",
            "is_verified",
            "cur_job_role",
            "educations",
            "work_experiences",
            "total_courses",
            "total_students",
            "total_reviews"
        ]

    def get_rating(self, obj):
        return round(obj.tutor_profile.rating, 1) if obj.tutor_profile and obj.tutor_profile.rating else 0.0

    def get_educations(self, obj):

        if hasattr(obj, 'tutor_profile') and obj.tutor_profile:
            educations = obj.tutor_profile.educations.all()
            return [
                {
                    "university": edu.university,
                    "degree": edu.degree,
                    "year_of_passing" : edu.year_of_passing
                }
                for edu in educations
            ]
        return []
    
    def get_work_experiences(self, obj):

        if hasattr(obj, 'tutor_profile') and obj.tutor_profile:
            work_experiences = obj.tutor_profile.work_experiences.all()
            return [
                {
                    "company": exp.company,
                    "job_role": exp.job_role,
                    "date_of_joining": exp.date_of_joining,
                    "date_of_leaving": exp.date_of_leaving
                }
                for exp in work_experiences
            ]
        return []
    
    def get_total_courses(self,obj):
        """ Get the total number of courses by the tutor """
        return obj.tutor_profile.instructed_courses.count()
    
    def get_total_students(self, obj):
        """Get total students under this tutor"""
        return Purchase.objects.filter(course__tutor=obj.tutor_profile).values("user").distinct().count()
    
    def get_total_reviews(self, obj):
        """ Get the total number of reviews received by the tutor """
        return obj.tutor_profile.reviews.count()

class AdminStudentSerializer(serializers.ModelSerializer):

   # Fields from User
    skills = serializers.StringRelatedField(many=True)
    profile_pic_url = serializers.CharField(source="profile_pic_url.url", allow_null=True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "is_active",
            "created_at",
            "updated_at",
            "skills",
            "profile_pic_url",  # Directly included if already storing as URL
            "linkedin_url",
            "bio",
            "country",
            "city",
        ]
