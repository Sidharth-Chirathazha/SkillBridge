from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import CourseSerializer ,CategorySerialzier, ModuleSerializer, ReviewSerializer, CommentSerializer, CourseTradeCreateSerializer, CourseTradeRequestSerializer
from .models import Category,Course,Module,Purchase,Review,Comment,CourseTradeModel
from rest_framework.exceptions import ValidationError
from rest_framework.viewsets import ModelViewSet,ReadOnlyModelViewSet
from rest_framework.exceptions import NotFound
from base.custom_pagination import CustomPagination
from django.db.models import Count, Sum, Q
import stripe
from skillbridge import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from decimal import Decimal
from wallet.models import Wallet, Transaction
from rest_framework.decorators import action
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
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    
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
            if self.request.user.role == "tutor":
                queryset = queryset.exclude(tutor__user=self.request.user)

        return queryset
    
    def get_object(self):
        queryset = Course.objects.annotate(
        total_modules=Count("modules"),
        total_duration=Sum("modules__duration"),
        total_purchases=Count("purchases")
        ).select_related("tutor__user")

        return get_object_or_404(queryset, pk=self.kwargs['pk'])
    
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
            total_duration=Sum("modules__duration"), # Note - Fix the bug here 
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
    
    def partial_update(self, request, *args, **kwargs): 
        print("Request Data (PATCH):", request.data) 
        instance = self.get_object() 
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if not serializer.is_valid():
            print("Serializer Errors:", serializer.errors) 
            return Response(serializer.errors, status=400)  
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
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        course_id = request.data.get("course_id")
        course = get_object_or_404(Course, id=course_id)

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'inr', 
                            'product_data': {
                                'name': course.title,
                                'description': course.description,
                            },
                            'unit_amount': int(course.price * 100),  
                        },
                        'quantity': 1,

                    }
                ],
                mode='payment',
                success_url=f'http://localhost:5173/{request.user.role}/courses/success?session_id={{CHECKOUT_SESSION_ID}}&course_title={course.title}',
                cancel_url=f'http://localhost:5173/{request.user.role}/dashboard',
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
            print(str(e))
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


        if event['type'] == 'checkout.session.completed':
            try:
                session = event['data']['object']
                user_id = session['metadata']['user_id']
                course_id = session['metadata']['course_id']
                course_price = Decimal(session['metadata']['course_price'])

                course = get_object_or_404(Course, id=course_id)
                tutor = course.tutor.user
                admin_user = User.objects.filter(is_superuser=True).first()

                tutor_share = course_price * Decimal(0.90)
                admin_share = course_price * Decimal(0.10)
                print(f"Tutor Share:{tutor_share}, Admin Share:{admin_share}")

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
                    
                tutor_wallet, _ = Wallet.objects.get_or_create(user=tutor)
                admin_wallet,_ = Wallet.objects.get_or_create(user=admin_user)

                try:
                    tutor_wallet.balance =  Decimal(tutor_wallet.balance) + tutor_share
                    tutor_wallet.save()

                    admin_wallet.balance = Decimal(admin_wallet.balance) + admin_share
                    admin_wallet.save()

                    Transaction.objects.create(
                        wallet=tutor_wallet,
                        amount=tutor_share,
                        transaction_type="credit",
                        description=f"Course sold: {course.title}"
                    )

                    Transaction.objects.create(
                        wallet=admin_wallet,
                        amount=admin_share,
                        transaction_type="credit",
                        description=f"Admin commission for course: {course.title}"
                    )
                    print("Wallet and transaction updated successfully")

                except Exception as e:
                    print(f"Error updating wallet/transaction: {e}")
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
                print(f"Webhook Event: {event}")

                return Response({'status': 'success'}, status=status.HTTP_200_OK)
            
            except IntegrityError:
                return Response({"error": "Duplicate purchase detected"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print("Webhook Error:", str(e))
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        
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


class CommentViewSet(ModelViewSet):

    queryset = Comment.objects.all().select_related("user", "course", "parent").prefetch_related("replies")
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        course_id = self.request.query_params.get("course")
        if course_id:
            return Comment.objects.filter(course=course_id, parent__isnull=True)
        return Comment.objects.none()
    
    def destroy(self, request, *args, **kwargs):
        """Allows only person who commented to delete their comment"""
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"detail": "You can only delete your own comments."}, status=403)
        return super().destroy(request, *args, **kwargs)
    
class CourseTradeViewSet(ModelViewSet):
    queryset = CourseTradeModel.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CourseTradeCreateSerializer
        return CourseTradeRequestSerializer

    def get_queryset(self):
        user = self.request.user
        return CourseTradeModel.objects.filter(
            Q(requester=user) | Q(accepter=user)
        )
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        requested_trades = queryset.filter(requester=request.user)
        received_trades = queryset.filter(accepter=request.user)

        requested_serializer = self.get_serializer(requested_trades, many=True)
        received_serializer = self.get_serializer(received_trades, many=True)

        return Response({
            "requested_trade_requests": requested_serializer.data,
            "received_trade_requests": received_serializer.data
        })
    

    def perform_create(self, serializer):
        requested_course = serializer.validated_data["requested_course"]
        accepter = requested_course.tutor.user
        serializer.save(requester=self.request.user, accepter=accepter)

    @action(detail=True, methods=["post"])
    def accept_trade(self,request,pk=None):
        trade_request = self.get_object()

        if trade_request.requested_course.tutor.user != request.user:
            return Response({"error": "You can only accept trades for your own courses"}, status=status.HTTP_403_FORBIDDEN)
        
        trade_request.status = "accepted"
        trade_request.save()

        Purchase.objects.create(user=trade_request.requester, course=trade_request.requested_course, status="completed")
        Purchase.objects.create(user=request.user, course=trade_request.offered_course, status="completed")

        return Response({"message": "Trade accepted. Both tutors have access to each other's courses."}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["post"])
    def decline_trade(self, request, pk=None):
        trade_request = self.get_object()

        if trade_request.requested_course.tutor.user != request.user:
            return Response({"error": "You can only decline trades for your own courses"}, status=status.HTTP_403_FORBIDDEN)

        trade_request.status = "declined"
        trade_request.save()
        return Response({"message": "Trade declined"}, status=status.HTTP_200_OK)