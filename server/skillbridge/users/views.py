from .serializers import UserCreationSerializer,UserLoginSerializer, SkillSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from student.serializers import StudentProfileSerializer
from tutor.serializers import TutorProfileSerializer
from rest_framework.parsers import MultiPartParser,FormParser,JSONParser
import json
from student.models import StudentProfile
from tutor.models import TutorProfile
from users.models import User, Skill
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

# Create your views here.

class CustomTokenRefreshView(TokenRefreshView):
    pass

class UserCreationHandlerView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserCreationSerializer(data=request.data)
        if serializer.is_valid():
            response = serializer.save()
            return Response(response, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    permission_classes = [AllowAny]

    print("Inside user login view")
    def post(self, request):
        print("Requset received at  login view")
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            print("Serializer is valid")
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": f"Login successful. Welcome to the {user.role} dashboard.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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
        user = request.user

        if user.role == 'tutor':
            serializer = TutorProfileSerializer(user.tutor_profile)
        elif user.role == 'student':
            serializer = StudentProfileSerializer(user.student_profile)
        else:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self,request):
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

        print("inside put :", json_data)
        print("Inside put",user.role)
        # Include file data if available
        if 'profile_pic' in request.FILES:
            print("Inside if in put",request.FILES['profile_pic'])
            json_data['user'] = json_data.get('user', {})
            json_data['user']['profile_pic_url'] = request.FILES['profile_pic']
            print(json_data['user']['profile_pic_url'])
        
        # Include file data if available
        if 'resume' in request.FILES:
            print("Inside if of resume in put",request.FILES['resume'])
            json_data['resume_url'] = request.FILES['resume']
            print(json_data['resume_url'])

        if user.role == 'tutor':
            serializer = TutorProfileSerializer(user.tutor_profile, data=json_data, partial=True, context={'request': request})
        elif user.role == 'student':
            print("Inside view of role student")
            serializer = StudentProfileSerializer(user.student_profile, data=json_data, partial=True, context={'request': request})
        else:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        if serializer.is_valid():
            print("serializer is valid")
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        role = request.data.get('role')

        if not token or not role:
            return Response({"error": "Token and role are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the Google token
            id_info = id_token.verify_oauth2_token(token, google_requests.Request())
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

        except ValueError as e:
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
        skills = Skill.objects.all()
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, skill_id):
        try:
            skill = Skill.objects.get(id=skill_id)
            skill.delete()
            return Response({"message": "Skill deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Skill.DoesNotExist:
            return Response({"error": "Skill not found."}, status=status.HTTP_404_NOT_FOUND)


   