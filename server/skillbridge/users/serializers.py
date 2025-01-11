from rest_framework import serializers
from tutor.models import TutorProfile
from student.models import StudentProfile
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.mail import send_mail
import random
from django.conf import settings
from .models import Skill

User = get_user_model()

# Serializer for User Registration 
class UserCreationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=["student","tutor"])
    password = serializers.CharField(write_only=True)

    def validate_email(self, email):
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email already exists")
        return email
    
    def save(self):
        email = self.validated_data['email']
        role = self.validated_data['role']
        password = self.validated_data['password']

        otp = random.randint(100000,999999)

        cache.set(f'otp_{email}', otp, timeout=30)

        send_mail(
            subject="Your OTP for Registration",
            message=f"Your OTP for Registration is {otp}. Expires in 2 minutes",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
        )
        return {"message": "OTP sent successfully.", "email": email, "role": role}

# Serializer for OTP verification
class OtpVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.IntegerField()
    role = serializers.ChoiceField(choices=["student", "tutor"])
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')

        # Check if the OTP is correct
        cached_otp = cache.get(f'otp_{email}')
        if cached_otp is None:
            raise serializers.ValidationError("Otp has expired. Please request for a new OTP.")
        if int(otp) != cached_otp:
            raise serializers.ValidationError("Invalid OTP.")
        
        return attrs
    
    def save(self):
        email = self.validated_data['email']
        role = self.validated_data['role']
        password = self.validated_data['password']

        user = User.objects.create_user(email=email, password=password, role=role)

        if role == 'student':
            StudentProfile.objects.create(user=user)
        elif role == 'tutor':
            TutorProfile.objects.create(user=user)
        
        cache.delete(f'otp_{email}')

        return user

# Serializer for User Login  
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[('student', 'Student'), ('tutor', 'Tutor')])

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        # Authenticate User
        user = authenticate(request=self.context.get('request'), email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        
        # Role check
        if user.role != role:
            raise serializers.ValidationError(f"User does not have the role : {role}")
        
        data['user'] = user
        return data
    

# User Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all, many=True, required=False)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'profile_pic_url', 'bio', 
            'country', 'city', 'skills', 'wallet_balance', 'role'
        ]
        read_only_fields = ['wallet_balance', 'role']

    