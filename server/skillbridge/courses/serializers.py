from rest_framework import serializers
from .models import Module,Course,Category, Review, Comment, CourseTradeModel
from tutor.models import TutorProfile
from django.contrib.auth import get_user_model
from cloudinary.utils import cloudinary_url
from cloudinary.models import CloudinaryField
import cloudinary.uploader
from django.db.models import Q

User = get_user_model()

"""Serializer for Course Module"""



    
"""Serilaizer for category - Handles Crud operations for category"""
class CategorySerialzier(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active']
        read_only_fields = ['slug']


class ModuleSerializer(serializers.ModelSerializer):
    video = serializers.FileField(required=False)
    tasks = serializers.FileField(required=False)

    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'description', 'video', 'duration', 'tasks', 'is_liked', 'likes_count', 'views_count']

    def create(self, validated_data):
        file = validated_data.get("tasks")

        if file:
            upload_result = cloudinary.uploader.upload(
                file,
                resource_type="raw", 
                use_filename=True,
                unique_filename=False,
                use_original_filename=True,
                invalidate=True
            )

            
            validated_data["tasks"] = upload_result["secure_url"].replace("/upload/", "/dl/upload/")

        return super().create(validated_data)

    def update(self, instance, validated_data):
        file = validated_data.get("tasks")

        if file:
            upload_result = cloudinary.uploader.upload(
                file,
                resource_type="raw",
                use_filename=True,
                unique_filename=False,
                use_original_filename=True,
                invalidate=True
            )

            
            validated_data["tasks"] = upload_result["secure_url"].replace("/upload/", "/dl/upload/")

        return super().update(instance, validated_data)


    def to_internal_value(self, data):

        if 'video' in data and isinstance(data['video'], str):
            del data['video']
        if 'tasks' in data and isinstance(data['tasks'], str):
            del data['tasks']
        return super().to_internal_value(data)
    

"""Creating a Tutor serializer specific to Course Serializer to include tutor name and tutor profile pic"""
class CourseTutorSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    profile_pic = serializers.ImageField(source="user.profile_pic_url", read_only=True)

    class Meta:
        model = TutorProfile
        fields = ['id', 'first_name', 'last_name', 'profile_pic']


"""Serializer for Course, Made the ModuleSerializer Read only field"""
class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    thumbnail = serializers.ImageField(required=False)
    tutor = CourseTutorSerializer(read_only=True)
    category = CategorySerialzier(read_only=True)
    total_modules = serializers.IntegerField(read_only=True)
    total_duration = serializers.IntegerField(read_only=True)
    total_purchases = serializers.IntegerField(read_only=True)
    is_under_trade = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'tutor', 'category', 'slug', 'title', 'description', 'thumbnail', 
                  'total_enrollment', 'status', 'skill_level', 'price', 'is_active', 
                  'rating', 'modules', 'total_modules', 'total_duration', 'total_purchases', "is_under_trade"]
        
    def get_is_under_trade(self, obj):
        request = self.context.get("request")
        
        if not request or not request.user.is_authenticated:
            return False
        return CourseTradeModel.objects.filter(
            Q(requested_course=obj) | Q(offered_course=obj),
            Q(accepter=request.user) | Q(requester=request.user),
            status = "pending"
        ).exists()


"""Serializer to include user first name and profile pic to the review"""
class ReviewUserSerializer(serializers.ModelSerializer):
    profile_pic_url = serializers.ImageField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'profile_pic_url']

"""Serialzer for reviews and ratings"""
class ReviewSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    user = ReviewUserSerializer(read_only=True)
    class Meta:
        model = Review
        fields = ['id','user', 'course', 'rating', 'review', 'created_at']
        read_only_fields = ['user', 'course', 'created_at']

    def create(self, validated_data):
        review = Review.objects.create(**validated_data)
        course = validated_data['course']
        course.update_rating()

        return review
    

"""Serializer for comments"""
class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    user_name = serializers.CharField(source="user.first_name", read_only=True)
    profile_pic = serializers.ImageField(source="user.profile_pic_url", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "user_name", "profile_pic", "course", "parent", "content", "created_at", "replies"]
        read_only_fields = ["user", "created_at"]  # User should be set automatically from the request


    def get_replies(self, obj):
        """Fetch Replies For a given comment"""
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True).data
    
    def validate(self, data):
        """Ensuring if a parent comment is given, It belongs to the same course"""
        parent = data.get("parent")
        if parent and parent.course != data["course"]:
            raise serializers.ValidationError("The parent comment must belong to the same course.")
        return data
    
class CourseTradeRequestSerializer(serializers.ModelSerializer):
    requester = serializers.SerializerMethodField()
    accepter =  serializers.SerializerMethodField()
    requested_course = serializers.SerializerMethodField()
    offered_course = serializers.SerializerMethodField()
    status = serializers.ChoiceField(choices=CourseTradeModel.STATUS_CHOICES , read_only=True)

    class Meta:
        model = CourseTradeModel
        fields = ["id", "requester", "requested_course", "offered_course", "accepter", "status", "created_at"]

    def get_requested_course(self, obj):
        return{
            "id": obj.requested_course.id,
            "title": obj.requested_course.title,
            "price": obj.requested_course.price
        }
    
    def get_offered_course(self, obj):
        return{
            "id": obj.offered_course.id,
            "title": obj.offered_course.title,
            "price": obj.offered_course.price
        }
    
    def get_requester(self, obj):
        return{
            "name":obj.requester.first_name + " " + obj.requester.last_name,
            "profile_pic": self.get_profile_pic_url(obj.requester.profile_pic_url)
        }
    
    def get_accepter(self, obj):
        return{
            "name":obj.accepter.first_name + " " + obj.accepter.last_name,
            "profile_pic": self.get_profile_pic_url(obj.accepter.profile_pic_url)
        }
    
    def get_profile_pic_url(self, profile_pic):
        if profile_pic:
            return profile_pic.url
        
        return "/default-avatar.jpg"

class CourseTradeCreateSerializer(serializers.ModelSerializer):

    requested_course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    offered_course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())

    class Meta:
        model = CourseTradeModel
        fields = ["requested_course", "offered_course"]

    def validate(self, data):
        requester = self.context["request"].user
        offered_course = data["offered_course"]
        requested_course = data["requested_course"]

        if offered_course.tutor.user != requester:
            raise serializers.ValidationError("You can only offer a course that you own.")
        
        if requested_course.tutor.user == requester:
            raise serializers.ValidationError("You cannot trade for your own course.")
        
        existing_request = CourseTradeModel.objects.filter(
            requester=requester,
            requested_course=requested_course,
            offered_course=offered_course,
            status="pending"
        ).exists()

        if existing_request:
            raise serializers.ValidationError("You have already sent a trade request for this course.")
        
        # if requested_course.price != offered_course.price:
        #     raise serializers.ValidationError("The requested course price must be equal to the offered course price.")

        return data
    
    def create(self, validated_data):

        trade_request = CourseTradeModel.objects.create(**validated_data)
        return trade_request