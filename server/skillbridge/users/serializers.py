from rest_framework import serializers
from tutor.models import TutorProfile
from student.models import StudentProfile
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.core.cache import cache
from .models import Skill,Notification
from .utils import generate_email_otp
from cloudinary.utils import cloudinary_url
from cloudinary.uploader import upload as cloudinary_upload
from wallet.models import Wallet

User = get_user_model()

# Serializer for User Registration 
class UserCreationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=["student","tutor"], required=False)
    password = serializers.CharField(write_only=True, required=False)
    otp = serializers.IntegerField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)

    def validate_email(self, email):
        if 'new_password' not in self.initial_data:
            if User.objects.filter(email=email).exists():
                if 'role' in self.initial_data:
                    raise serializers.ValidationError("Email already exists")
            else:
                if 'role' not in self.initial_data:
                    raise serializers.ValidationError("Email does not exist")
        
        return email
    
    def validate(self, attrs):
        if 'otp' in attrs:
            email = attrs.get('email')
            otp = attrs.get('otp')

            # Check if the OTP is correct
            cached_otp = cache.get(f'otp_{email}')
            if cached_otp is None:
                raise serializers.ValidationError("Otp has expired. Please request for a new OTP.")
            if int(otp) != cached_otp:
                raise serializers.ValidationError("Invalid OTP.")
            
            # Ensure new_password is provided for password reset
            if 'new_password' in attrs and not attrs.get('new_password'):
                raise serializers.ValidationError("New password is required for password reset.")
            
        return attrs
    
    def save(self):
        email = self.validated_data.get('email')
        role = self.validated_data.get('role')
        password = self.validated_data.get('password')
        otp = self.validated_data.get('otp')
        new_password = self.validated_data.get('new_password')

        if otp and role and password: # Case 1: User creation after OTP verification
            user = User.objects.create_user(email=email, password=password, role=role)
            Wallet.objects.create(user=user)
            if role == 'student':
                StudentProfile.objects.create(user=user)
                print("Student created")
            elif role == 'tutor':
                TutorProfile.objects.create(user=user)
                print("Tutor created")
            cache.delete(f'otp_{email}') # Remove OTP after successful verification
            return {"message": "User created successfully."}
        
        elif email and password and role:
            generate_email_otp(email, subject="Registration")
            return {"message": "OTP sent for registration.", "email": email}
        
        elif email and not(password or role or otp or new_password):
            if not User.objects.filter(email=email).exists():
                raise serializers.ValidationError("Email does not exists")
            generate_email_otp(email, subject="Password reset")
            return {"message": "OTP sent for password reset.", "email": email}
        
        elif email and otp and not new_password:
            return {"message": "OTP verified. You can now reset your password."}
        
        elif email and new_password:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            cache.delete(f'otp_{email}')
            return {"message": "Your password has been reset successfully."}
        
        raise serializers.ValidationError("Invalid request parameters.")

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
    skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True, required=False)
    profile_pic_url = serializers.ImageField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_null=True)
    linkedin_url = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id','email', 'first_name', 'last_name', 'phone', 'profile_pic_url','linkedin_url', 'bio', 
            'country', 'city', 'skills', 'role'
        ]
        read_only_fields = ['wallet_balance', 'role', 'id']

    
    def validate_phone(self, value):
        print("Inside validate_phone")
        user = self.context.get('request').user

        if value == user.phone:
            return value
        
        if User.objects.filter(phone=value).exclude(id=user.id).exists():
            print("Inside If")
            raise serializers.ValidationError("This phone number is already in use.")
        return value
    
    def validate_linkedin_url(self, value):
        print("Inside validate_linkedin_url")
        user = self.context.get('request').user

        if value == user.linkedin_url:
            return value
        
        if User.objects.filter(linkedin_url=value).exclude(id=user.id).exists():
            print("Inside If")
            raise serializers.ValidationError("This linkedin url is already in use.")
        return value
    
    def update(self, instance, validated_data):
        # Handle profile_pic_url (Cloudinary upload)
        profile_pic = validated_data.pop('profile_pic_url', None)
        if profile_pic:
             # Upload the image to Cloudinary and get the public_id
             cloudinary_response = cloudinary_upload(profile_pic)
             instance.profile_pic_url = cloudinary_response.get('public_id')

        # Update other fields
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
    
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'skill_name']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', "notification_type", "message", "is_read", "created_at"]

    