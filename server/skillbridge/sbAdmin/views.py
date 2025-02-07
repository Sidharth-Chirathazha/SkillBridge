from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AdminLoginSerializer,AdminTutorSerializer,AdminStudentSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny,IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from users.models import User


# Create your views here.
@method_decorator(csrf_exempt, name='dispatch')
class AdminLoginView(APIView):
    permission_classes =[AllowAny]
    def post(self,request):
        serializer = AdminLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class AdminLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                print("Refresh Token Missing")
                return Response({"error":"Refresh token missing"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                print("Refresh token is present")
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            print("Invalid token")
            return Response({"error": "Invalid token or token already blacklisted."}, status=status.HTTP_400_BAD_REQUEST)
        
class AdminDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user
        if user.is_superuser:
            return Response({"email": user.email}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "You are not authorized to access this resource."}, status=status.HTTP_403_FORBIDDEN)
        
class AdminTutorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id=None):

        if id:
            try:
                tutor = User.objects.get(id=id, role="tutor")
                serializer = AdminTutorSerializer(tutor)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response({"detail": "Tutor not found."}, status=404)
        else:
            tutors = User.objects.filter(role="tutor")
            serializer = AdminTutorSerializer(tutors, many=True)
            return Response(serializer.data)
        
    def patch(self, request, id=None):
        if not id:
            return Response({"detail": "Tutor ID is required."}, status=400)
        
        try:
            tutor = User.objects.get(id=id, role="tutor")
        except:
            return Response({"detail": "Tutor not found."}, status=404)
        
        is_verified = request.data.get("is_verified")
        if is_verified is not None:
            tutor.tutor_profile.is_verified = is_verified
            tutor.tutor_profile.save()
            return Response({"detail": f"Tutor {'authorized' if is_verified else 'unauthorized'} successfully."})
        return Response({"detail": "Invalid data."}, status=400)
    
class AdminStudentListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, id=None):

        if id:
            try:
                student = User.objects.get(id=id, role="student")
                serializer = AdminStudentSerializer(student)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response({"detail": "Student not found."}, status=404)
        else:
            students = User.objects.filter(role="student")
            serializer = AdminStudentSerializer(students, many=True)
            return Response(serializer.data)
    
class UpdateUserStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, id=None):
        if not id:
            return Response({"detail": "Tutor ID/Student ID is required."}, status=400)
        try:
            user = User.objects.get(id=id)
        except:
            return Response({"detail": "Tutor/Student not found."}, status=404)

        is_active = request.data.get("is_active")
        if is_active is not None:
            user.is_active = is_active
            user.save()
            return Response({"detail": f"User {'blocked' if is_active else 'unblocked'} successfully."})
        return Response({"detail": "Invalid data."}, status=400)