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
from rest_framework.viewsets import ModelViewSet
from base.custom_pagination import CustomPagination
from django.shortcuts import get_object_or_404


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
        
class AdminTutorViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.filter(role="tutor").order_by("-created_at")
    serializer_class = AdminTutorSerializer
    pagination_class = CustomPagination

    def retrieve(self, request, pk=None):
        tutor = get_object_or_404(User, id=pk, role="tutor")
        serializer = self.get_serializer(tutor)
        return Response(serializer.data)
    
    def partial_update(self, request, pk=None):
        """Handles partial updates (PATCH) for tutor verification"""
        tutor = get_object_or_404(User, id=pk, role="tutor")
        is_verified = request.data.get("is_verified")

        if is_verified is not None:
            tutor.tutor_profile.is_verified = is_verified
            tutor.tutor_profile.save()
            return Response({"detail": f"Tutor {'authorized' if is_verified else 'unauthorized'} successfully."})

        return Response({"detail": "Invalid data."}, status=400)
        



class AdminStudentViewSet(ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = User.objects.filter(role="student").order_by("-created_at")
    serializer_class = AdminStudentSerializer
    pagination_class = CustomPagination

    def retrieve(self, request, pk=None):
        student = get_object_or_404(User, id=pk, role="student")
        serializer = self.get_serializer(student)
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