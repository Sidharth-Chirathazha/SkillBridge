from .serializers import UserCreationSerializer,UserLoginSerializer,OtpVerificationSerializer,UserProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from student.serializers import StudentProfileSerializer
from tutor.serializers import TutorProfileSerializer


# Create your views here.

class UserCreationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserCreationSerializer(data=request.data)
        if serializer.is_valid():
            response = serializer.save()
            return Response(response, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class OtpVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = OtpVerificationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
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


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = UserProfileSerializer(user).data

        if user.role == 'tutor':
            tutor_data = TutorProfileSerializer(user.tutor_profile).data
            return Response({**user_data, **tutor_data})
        
        elif user.role == 'student':
            student_data = StudentProfileSerializer(user.student_profile).data
            return Response({**user_data, **student_data})
        
        return Response(user_data)

    def post(self, request):
        user = request.user
        if user.role == 'tutor':
            user_serializer = UserProfileSerializer(user, data=request.data, partial = True)
            tutor_serializer = TutorProfileSerializer(user.tutor_profile, data=request.data, partial=True)

            if user_serializer.is_valid() and tutor_serializer.is_valid():
                user_serializer.save()
                tutor_serializer.save()
                return Response({"message": "Tutor profile completed."}, status=status.HTTP_200_OK)

            return Response(
                {"user_errors": user_serializer.errors, "tutor_errors": tutor_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        elif user.role == 'student':
            user_serializer = UserProfileSerializer(user, data=request.data, partial=True)

            if user_serializer.is_valid():
                user_serializer.save()
                return Response({"message": "Student profile completed."}, status=status.HTTP_200_OK)

            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)