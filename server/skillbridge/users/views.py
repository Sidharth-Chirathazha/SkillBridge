import jwt
import datetime
import json
import logging
from .serializers import UserCreationSerializer,UserLoginSerializer, SkillSerializer, NotificationSerializer, UserActivitySerializer, BlogSerializer, CommentSerializer
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError,PermissionDenied,NotFound
from google.auth.exceptions import GoogleAuthError
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser,IsAuthenticatedOrReadOnly
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from student.serializers import StudentProfileSerializer
from tutor.serializers import TutorProfileSerializer
from rest_framework.parsers import MultiPartParser,FormParser,JSONParser
from datetime import date
from datetime import timedelta
from django.utils.timezone import now
from student.models import StudentProfile
from tutor.models import TutorProfile
from users.models import User, Skill, Notification, UserActivity,Blog,Comment
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from base.custom_pagination import CustomPagination
from django.conf import settings
from base.custom_pagination import BlogPagination




logger = logging.getLogger(__name__)


# Create your views here.

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID

class CustomTokenRefreshView(TokenRefreshView):
    pass

class UserCreationHandlerView(APIView):
    permission_classes = [AllowAny]


    def post(self, request, *args, **kwargs):
        try:
            serializer = UserCreationSerializer(data=request.data)
            if serializer.is_valid():
                response = serializer.save()
                return Response(response, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = UserLoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                refresh = RefreshToken.for_user(user)
                return Response({
                    "message": f"Login successful. Welcome to the {user.role} dashboard.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "role": user.role,
                }, status=status.HTTP_200_OK)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({"error": "Refresh token is missing."}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token or already logged out."}, status=status.HTTP_400_BAD_REQUEST)
        

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


    def get(self,request):
        try:
            user = request.user
            if not user.is_active:
                return Response({'error': 'Account is inactive. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)
            
            if user.role == 'tutor':
                serializer = TutorProfileSerializer(user.tutor_profile)
            elif user.role == 'student':
                serializer = StudentProfileSerializer(user.student_profile)
            else:
                return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'An error occurred while fetching the profile.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self,request):
        try:
            user = request.user

            # Extract and parse JSON data safely
            json_data = request.data.get('json_data')
            if json_data:
                try:
                    json_data = json.loads(json_data)
                except json.JSONDecodeError as e:
                    return Response({'error': 'Invalid JSON data', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            else:
                json_data = {}

            # Include file data if available
            if 'profile_pic' in request.FILES:
                json_data['user'] = json_data.get('user', {})
                json_data['user']['profile_pic_url'] = request.FILES['profile_pic']
            
            # Include file data if available
            if 'resume' in request.FILES:
                json_data['resume_url'] = request.FILES['resume']

            if user.role == 'tutor':
                serializer = TutorProfileSerializer(user.tutor_profile, data=json_data, partial=True, context={'request': request})
            elif user.role == 'student':
                serializer = StudentProfileSerializer(user.student_profile, data=json_data, partial=True, context={'request': request})
            else:
                return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
             return Response({'error': 'An error occurred while updating the profile.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        role = request.data.get('role')

        logger.info(f"Received Token: {token}, Role: {role}")

        if not token or not role:
            return Response({"error": "Token and role are required."}, status=status.HTTP_400_BAD_REQUEST)
        if role not in ['student', 'tutor']:
            return Response({"error": "Invalid role. Must be 'student' or 'tutor'."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the Google token
            logger.info(f"Current server time: {datetime.datetime.now()}")
            decoded = jwt.decode(token, options={"verify_signature": False})
            logger.info(f"Token payload: {decoded}")


            id_info = id_token.verify_oauth2_token(token, google_requests.Request(), audience=GOOGLE_CLIENT_ID, clock_skew_in_seconds=2)
            email = id_info.get('email')
            first_name = id_info.get('given_name', '')
            last_name = id_info.get('family_name', '')

            if not email:
                return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user exists
            user, created = User.objects.get_or_create(email=email, defaults={
                "first_name": first_name,
                "last_name": last_name,
                "role": role,
            })

            if created:
                # Create profiles based on role
                if role == 'student':
                    StudentProfile.objects.create(user=user)
                elif role == 'tutor':
                    TutorProfile.objects.create(user=user)
                user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SkillListHandleView(APIView):
    """Handling permission classes based on the authenticated user"""
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        elif self.request.method in ['POST', 'DELETE']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def get(self, request):
        try:
            skills = Skill.objects.all()
            paginator =  CustomPagination()
            paginated_skills = paginator.paginate_queryset(skills, request)
            serializer = SkillSerializer(paginated_skills, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Skill.DoesNotExist:
            return Response({"error": "Skills not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "An error occurred while fetching skills.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = SkillSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'An error occurred while creating the skill.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, skill_id):
        try:
            skill = Skill.objects.get(id=skill_id)
            skill.delete()
            return Response({"message": "Skill deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Skill.DoesNotExist:
            return Response({"error": "Skill not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "An error occurred while deleting the skill.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class NotificationViewSet(ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user).order_by("-created_at")
    
    
    @action(detail=False, methods=["POST"])
    def mark_all_as_read(self, request):
        try:
            updated_count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            if updated_count == 0:
                return Response({"message": "No unread notifications found."}, status=status.HTTP_200_OK)
            return Response({"message": f"{updated_count} notifications marked as read."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Failed to mark notifications as read.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=["POST"])
    def mark_single_as_read(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            if notification.is_read:
                return Response({"message": "Notification is already marked as read."}, status=status.HTTP_200_OK)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read"}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Failed to mark notification as read.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=["DELETE"])
    def delete_read_notifications(self, request):
        try:
            deleted_count, _ = Notification.objects.filter(user=request.user, is_read=True).delete()
            if deleted_count == 0:
                return Response({"message": "No read notifications found to delete."}, status=status.HTTP_200_OK)
            return Response({"message": f"Deleted {deleted_count} read notifications"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Failed to delete read notifications.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


class UpdateLearningTimeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        today = date.today()
        time_spent = request.data.get("time_spent")

        try:
            time_spent = int(time_spent)
            if time_spent < 0:
                return Response({"error": "Time spent must be a non-negative integer."}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Invalid time_spent value. Please provide a valid integer."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Try to get today's record, else create it
            activity, created = UserActivity.objects.get_or_create(
                user=user, date=today,
                defaults={"time_spent": time_spent}
            )

            if not created:
                # If record exists, update the time spent
                activity.time_spent += int(time_spent)
                activity.save()

            # Update total time in User model
            user.total_time_spent = sum(user.activities.values_list("time_spent", flat=True))
            user.save()

            return Response({
                "message": "Time updated",
                "total_time_spent": user.total_time_spent,
                "today_time_spent": activity.time_spent
            })
        except Exception as e:
            return Response({"error": "An error occurred while updating time.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class UserLearningActivityView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserActivitySerializer

    def get_queryset(self):
        user = self.request.user
        time_period = self.request.query_params.get("period", "weekly")  # default to weekly

        today = now().date()

        # Validate time_period
        if time_period not in ["daily", "weekly", "monthly"]:
            raise ValidationError({"error": "Invalid time period. Use 'daily', 'weekly', or 'monthly'."})

        if time_period == "daily":
            start_date = today
        elif time_period == "monthly":
            start_date = today.replace(day=1)
        else:  # default weekly
            start_date = today - timedelta(days=7)

        return UserActivity.objects.filter(user=user, date__gte=start_date).order_by("date")

        
class BlogViewSet(ModelViewSet):
    queryset = Blog.objects.all().order_by('-created_at')
    serializer_class = BlogSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = BlogPagination

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        try:
            blog = self.get_object()
            if blog.author != self.request.user:
                raise PermissionDenied("You do not have permission to edit this blog.")
            serializer.save()
        except Blog.DoesNotExist:
            raise PermissionDenied("Blog not found.")
        except Exception as e:
            raise PermissionDenied(str(e))
        
    def perform_destroy(self, instance):
        try:
            if instance.author != self.request.user and not self.request.user.is_superuser:
                raise PermissionDenied("You do not have permission to delete this blog.")
            instance.delete()
        except Exception as e:
            raise PermissionDenied(str(e))

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        try:
            blog = self.get_object()
            if request.user in blog.likes.all():
                blog.likes.remove(request.user)
                return Response({"message": "Blog unliked"})
            else:
                blog.likes.add(request.user)
                return Response({"message": "Blog liked"})
        except NotFound:
            return Response({"error": "Blog not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CommentViewSet(ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        try:
            if instance.user != self.request.user:
                raise PermissionDenied("You do not have permission to delete this comment.")
            instance.delete()
        except Exception as e:
            raise PermissionDenied(str(e))