from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import CourseSerializer,CategorySerialzier,ModuleSerializer,ReviewSerializer
from .models import Category,Course,Module,Purchase,Review
from rest_framework.exceptions import ValidationError
from rest_framework.viewsets import ModelViewSet,ReadOnlyModelViewSet
from rest_framework.exceptions import NotFound
from base.custom_pagination import CustomPagination
from django.db.models import Count, Sum
import stripe
from skillbridge import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction

User = get_user_model()
stripe.api_key = settings.STRIPE_SECRET_KEY


"""Handles the CRUD Operations for Courses"""
class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = CustomPagination

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = (Course.objects.annotate(
            total_modules = Count("modules"),
            total_duration = Sum("modules__duration"),
            total_purchases = Count("purchases")
        ).select_related("tutor__user"))

        tutor_id = self.request.query_params.get('tutor_id')
        status = self.request.query_params.get('status')
        print(status)
        if tutor_id:
            queryset = queryset.filter(tutor=tutor_id)
            if not queryset.exists():
                raise NotFound({"detail": "No courses found for this tutor."})
        if status:
            queryset = queryset.filter(status=status, is_active=True)
            if not queryset.exists():
                raise NotFound({"detail: No courses found with this status"})
        if self.request.user.is_authenticated:
            print("inside request.user in course view set")
            queryset = queryset.exclude(id__in=Purchase.objects.filter(user=self.request.user).values('course'))

        return queryset
    
    def perform_create(self, serializer):
        """Assigning the tutor from the request user to the CourseSerializer"""
        try:
            tutor_profile = self.request.user.tutor_profile
        except:
            raise ValidationError({"tutor": "You must be a tutor to create a course."})
        serializer.save(tutor=tutor_profile)

"""Handles the listing and retreival of purchased course"""
class PurchasedCoursesViewSet(ReadOnlyModelViewSet):
     serializer_class = CourseSerializer
     permission_classes = [IsAuthenticated]
     pagination_class = CustomPagination

     def get_queryset(self):
         purchased_courses = Purchase.objects.filter(user=self.request.user).values('course')
         queryset = (Course.objects.filter(id__in=purchased_courses).annotate(
            total_modules=Count("modules", distinct=True),
            total_duration=Sum("modules__duration"),
            total_purchases=Count("purchases", distinct=True)
            ).select_related("tutor__user"))
         
         return queryset

"""Handles the CRUD Operations for Course Module"""
class ModuleViewSet(ModelViewSet):
    serializer_class = ModuleSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Module.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course=course_id)
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def partial_update(self, request, *args, **kwargs):  # Handles PATCH requests
        print("Request Data (PATCH):", request.data)  # Print request data for debugging
        instance = self.get_object()  # Get the specific Module instance
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if not serializer.is_valid():
            print("Serializer Errors:", serializer.errors)  # Print errors to console
            return Response(serializer.errors, status=400)  # Return the error response
        
        return super().partial_update(request, *args, **kwargs)
     

"""Handles the CRUD Operations for category"""
class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerialzier


    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if Category.objects.filter(name=request.data.get('name')).exists():
            raise ValidationError({"error": "Category with this name already exists."})
        return super().create(request, *args, **kwargs)


"""View to handle Stripe Payment"""
class CreateCheckoutSession(APIView):
    permission_classes = [IsAuthenticated
                          ]
    def post(self, request, *args, **kwargs):
        course_id = request.data.get("course_id")
        course = get_object_or_404(Course, id=course_id)

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'inr',  # Replace with your currency
                            'product_data': {
                                'name': course.title,
                                'description': course.description,
                            },
                            'unit_amount': int(course.price * 100),  # Convert to cents
                        },
                        'quantity': 1,

                    }
                ],
                mode='payment',
                success_url=f'http://localhost:5173/student/courses/success?session_id={{CHECKOUT_SESSION_ID}}&course_title={course.title}',
                cancel_url='http://localhost:5173/cancel',
                metadata={
                    'course_id': course_id,
                    'user_id': request.user.id,
                    'course_title': course.title,
                    'course_price': str(course.price)
                },
                customer_email=request.user.email if request.user.email else None,
                 
            )

            return Response({'sessionId':checkout_session.id})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class StripeWebhookView(APIView):
    print("inside stripe webhook view")
    permission_classes=[AllowAny]
    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)


        # Handle the event
        if event['type'] == 'checkout.session.completed':
            try:
                session = event['data']['object']
                user_id = session['metadata']['user_id']
                course_id = session['metadata']['course_id']

                
                with transaction.atomic():
                    purchase, created = Purchase.objects.get_or_create(
                        user_id=user_id,
                        course_id=course_id,
                         defaults={
                            'stripe_payment_intent_id': session['payment_intent'],
                            'status': 'completed',
                        }
                    )
                    if not created:
                        return Response({"error": "You have already purchased this course"}, status=status.HTTP_400_BAD_REQUEST)
                return Response({'status': 'success'}, status=status.HTTP_200_OK)
            
            except IntegrityError:
                return Response({"error": "Duplicate purchase detected"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Return a response for unhandled event types
        return Response({'error': 'Unhandled event type'}, status=status.HTTP_400_BAD_REQUEST)


class VerifyPurchase(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')

        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == 'paid':
                purchase = Purchase.objects.get(
                    user=request.user,
                    course_id=session.metadata['course_id'] 
                )
                purchase.status = 'completed'
                purchase.save()

                return Response({'status': 'success'})
                
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
"""View to handle reviews and ratings"""
class ReviewViewSet(ModelViewSet):
    serializer_class= ReviewSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        course_slug = self.request.query_params.get("course_slug")
        if course_slug:
            course = Course.objects.get(slug=course_slug)
            return course.reviews.all()
        return Review.objects.all()
    
    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        user = self.request.user
        if Review.objects.filter(user=user, course=course).exists():
            raise ValidationError({"detail": "You have already reviewed this course."})
        serializer.save(user=user)