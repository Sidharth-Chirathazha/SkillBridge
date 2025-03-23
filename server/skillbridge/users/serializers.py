from rest_framework import serializers
from tutor.models import TutorProfile
from student.models import StudentProfile
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.core.cache import cache
from .models import Skill,Notification,UserActivity,Blog,Comment
from .tasks import sent_otp_email
from cloudinary.uploader import upload as cloudinary_upload
from wallet.models import Wallet
import logging



logger = logging.getLogger(__name__)
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
            elif role == 'tutor':
                TutorProfile.objects.create(user=user)
            cache.delete(f'otp_{email}') # Remove OTP after successful verification
            return {"message": "User created successfully."}
        
        elif email and password and role:
            subject = "Registration"
            try:
                if isinstance(email, str) and isinstance(subject, str):
                    task = sent_otp_email.delay(email, subject)
                    logger.info(f"OTP email task sent for {email}")
                else:
                     logger.warning(f"Invalid email or subject: email={type(email)}, subject={type(subject)}")
            except Exception as e:
                 logger.error(f"Error sending OTP email task: {e}", exc_info=True)
            return {"message": "OTP sent for registration.", "email": email}
        
        elif email and not(password or role or otp or new_password):
            if not User.objects.filter(email=email).exists():
                raise serializers.ValidationError("Email does not exists")
            subject="Password reset"
            sent_otp_email.delay(email, subject)
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
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        fields = [
            'id','email', 'first_name', 'last_name', 'phone', 'profile_pic_url','linkedin_url', 'bio', 
            'country', 'city', 'skills', 'role', 'full_name'
        ]
        read_only_fields = ['wallet_balance', 'role', 'id']

    
    def validate_phone(self, value):
        user = self.context.get('request').user

        if value == user.phone:
            return value
        
        if User.objects.filter(phone=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("This phone number is already in use.")
        return value
    
    def validate_linkedin_url(self, value):
        user = self.context.get('request').user

        if value == user.linkedin_url:
            return value
        
        if User.objects.filter(linkedin_url=value).exclude(id=user.id).exists():
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


class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ["date", "time_spent"]

class BlogUserSerializer(serializers.ModelSerializer):
    profile_pic_url = serializers.ImageField(read_only=True)
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    class Meta:
        model = User
        fields = ['id', 'profile_pic_url', 'full_name']

class CommentSerializer(serializers.ModelSerializer):
    user = BlogUserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'blog', 'user', 'content', 'parent', 'replies', 'created_at']

    def get_replies(self, obj):
        # Recursively serialize replies
        replies = Comment.objects.filter(parent=obj).order_by('created_at')
        serializer = CommentSerializer(replies, many=True)
        return serializer.data
    
class BlogSerializer(serializers.ModelSerializer):
    author = BlogUserSerializer(read_only=True)
    total_likes = serializers.IntegerField(read_only=True)
    comments = serializers.SerializerMethodField()
    thumbnail = serializers.ImageField(required=False)
    class Meta:
        model = Blog
        fields = fields = [
            'id',
            'author',
            'title',
            'description',
            'thumbnail',
            'created_at',
            'updated_at',
            'likes',
            'total_likes',
            'comments',
        ]

    def get_comments(self, obj):
        # Only get top-level comments (no parent)
        comments = Comment.objects.filter(blog=obj, parent=None).order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return serializer.data