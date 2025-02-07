from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.exceptions import ValidationError
from .serializers import TutorReviewSerializer
from .models import TutorProfile, TutorReview
# Create your views here.


"""View to handle reviews and ratings"""
class TutorReviewViewSet(ModelViewSet):
    serializer_class= TutorReviewSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        tutor_id = self.request.query_params.get("tutor_id")
        if tutor_id:
            tutor = TutorProfile.objects.get(id=tutor_id)
            return tutor.reviews.all()
        return TutorReview.objects.all()
    
    def perform_create(self, serializer):
        tutor = serializer.validated_data['tutor']
        user = self.request.user
        if TutorReview.objects.filter(user=user, tutor=tutor).exists():
            raise ValidationError({"detail": "You have already reviewed this tutor."})
        serializer.save(user=user)