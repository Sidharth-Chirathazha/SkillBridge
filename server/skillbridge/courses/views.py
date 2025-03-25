from django.shortcuts import render, get_object_or_404
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import DatabaseError
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import CourseSerializer ,CategorySerialzier, ModuleSerializer, ReviewSerializer, CommentSerializer, CourseTradeCreateSerializer, CourseTradeRequestSerializer, ChatRoomSerializer, ChatMessageSerializer
from .models import Category,Course,Module,Purchase,Review,Comment,CourseTradeModel,ModuleCompletion,ChatRoom, ChatMessage
from rest_framework.exceptions import ValidationError
from rest_framework.viewsets import ModelViewSet,ReadOnlyModelViewSet
from rest_framework.exceptions import NotFound
from base.custom_pagination import CustomPagination
from base.constants import TUTOR_SHARE_PERCENT, ADMIN_SHARE_PERCENT
from django.db.models import Count, Sum, Q, Value
from django.db.models.functions import Coalesce
import stripe
from django.utils import timezone
from skillbridge import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from decimal import Decimal
from wallet.models import Wallet, Transaction
from rest_framework.decorators import action
from users.models import Notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import traceback
import logging


logger = logging.getLogger(__name__)
User = get_user_model()
stripe.api_key = settings.STRIPE_SECRET_KEY


"""Handles the CRUD Operations for Courses"""
class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = CustomPagination

    def get_permissions(self):
        try:
            if self.action in ['list', 'retrieve']:
                permission_classes = [AllowAny]
            else:
                permission_classes = [IsAuthenticated]
            return [permission() for permission in permission_classes]
        except Exception as e:
            raise APIException(f"Error in get_permissions: {str(e)}")
    
    def get_serializer_context(self):
        try:
            context = super().get_serializer_context()
            context["request"] = self.request
            return context
        except Exception as e:
            raise APIException(f"Error in get_serializer_context: {str(e)}")
    
    def get_queryset(self):
        try:
            queryset = (Course.objects.annotate(
                total_modules = Count("modules", distinct=True),
                total_duration = Coalesce(Sum("modules__duration", distinct=True), Value(0)),
                total_purchases = Count("purchases", filter=Q(purchases__status="completed"), distinct=True)
            ).select_related("tutor__user"))

            tutor_id = self.request.query_params.get('tutor_id')
            status = self.request.query_params.get('status')
            category_id = self.request.query_params.get('category_id')
            limit = self.request.query_params.get('limit')
            search = self.request.query_params.get('search')

            if tutor_id:
                queryset = queryset.filter(tutor=tutor_id)
                if not queryset.exists():
                    raise NotFound({"detail": "No courses found for this tutor."})
            if status:
                if status == "Approved":
                    active_status = True
                else:
                    active_status = False
                queryset = queryset.filter(status=status, is_active=active_status)
                # if not queryset.exists():
                #     raise NotFound({"detail: No courses found with this status"})
                
            if category_id:
                queryset = queryset.filter(category=category_id)
                # if not queryset.exists():
                #     raise NotFound({"detail: No courses found with this category"})

            if limit:
                try:
                    limit = int(limit)
                    queryset = queryset[:limit]
                except ValueError:
                    pass  # Ignore invalid limit values

            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search)
                )

            if self.request.user.is_authenticated:
                queryset = queryset.exclude(id__in=Purchase.objects.filter(user=self.request.user).values('course'))
                if self.request.user.role == "tutor":
                    queryset = queryset.exclude(tutor__user=self.request.user)

            return queryset
        except DatabaseError as e:
            raise APIException(f"Database error: {str(e)}")
        except Exception as e:
            raise APIException(f"Unexpected error in get_queryset: {str(e)}")
    
    def get_object(self):
        try:
            queryset = Course.objects.annotate(
            total_modules=Count("modules", distinct=True),
            total_duration=Coalesce(Sum("modules__duration", distinct=True), Value(0)),
            total_purchases=Count("purchases", filter=Q(purchases__status="completed"), distinct=True)
            ).select_related("tutor__user")

            return get_object_or_404(queryset, pk=self.kwargs['pk'])
        except Http404:
            raise NotFound({"detail": "Course not found."})
        except DatabaseError as e:
            raise APIException(f"Database error: {str(e)}")
        except Exception as e:
            raise APIException(f"Error in get_object: {str(e)}")
    
    def perform_create(self, serializer):
        """Assigning the tutor from the request user to the CourseSerializer"""
        try:
            tutor_profile = self.request.user.tutor_profile
            serializer.save(tutor=tutor_profile)
        except AttributeError:
            raise ValidationError({"tutor": "You must be a tutor to create a course."})
        except DjangoValidationError as e:
            raise ValidationError({"error": str(e)})
        except Exception as e:
            raise APIException(f"Unexpected error in perform_create: {str(e)}")

"""Handles the listing and retreival of purchased course"""
class PurchasedCoursesViewSet(ReadOnlyModelViewSet):
     serializer_class = CourseSerializer
     permission_classes = [IsAuthenticated]
     pagination_class = CustomPagination


     def get_serializer_context(self):
        try:
            context = super().get_serializer_context()
            context["request"] = self.request
            return context
        except Exception as e:
            raise APIException(f"Error in get_serializer_context: {str(e)}")

     def get_queryset(self):
         try:
            purchased_courses = Purchase.objects.filter(user=self.request.user).values('course')
            queryset = (Course.objects.filter(id__in=purchased_courses).annotate(
                total_modules=Count("modules", distinct=True),
                total_duration=Coalesce(Sum("modules__duration", distinct=True), Value(0)),
                total_purchases=Count("purchases", distinct=True)
                ).select_related("tutor__user"))
            
            category_id = self.request.query_params.get('category_id')
            search = self.request.query_params.get('search')

            if category_id:
                queryset = queryset.filter(category=category_id)
                # if not queryset.exists():
                #     raise NotFound({"detail: No courses found with this category"})
                
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search)
                )
            
            return queryset
         
         except DatabaseError as e:
            raise APIException(f"Database error: {str(e)}")
         except Exception as e:
            raise APIException(f"Unexpected error in get_queryset: {str(e)}")

"""Handles the CRUD Operations for Course Module"""
class ModuleViewSet(ModelViewSet):
    serializer_class = ModuleSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        try:
            queryset = Module.objects.all()
            course_id = self.request.query_params.get('course_id')
            if course_id:
                queryset = queryset.filter(course=course_id)
            return queryset
        except DatabaseError as e:
            raise APIException(f"Database error: {str(e)}")
        except Exception as e:
            raise APIException(f"Unexpected error in get_queryset: {str(e)}")
    
    def get_permissions(self):
        try:
            if self.action in ['list', 'retrieve']:
                permission_classes = [AllowAny]
            else:
                permission_classes = [IsAuthenticated]
            return [permission() for permission in permission_classes]
        except Exception as e:
            raise APIException(f"Error in get_permissions: {str(e)}")
    
    def get_serializer_context(self):
        """Pass request context to the serializer"""
        try:
            context = super().get_serializer_context()
            context["request"] = self.request
            return context
        except Exception as e:
            raise APIException(f"Error in get_serializer_context: {str(e)}")
    
    def partial_update(self, request, *args, **kwargs): 
        try:
            instance = self.get_object() 
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=400)  
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    @action(detail=True, methods=["PATCH"], permission_classes=[IsAuthenticated])
    def mark_completed(self, request, pk=None):
        """Mark a module as completed by a specific user and update the course progress"""
        try:
            module = self.get_object()
            user = request.user

            try:
                purchase = Purchase.objects.get(user=user, course=module.course)
            except Purchase.DoesNotExist:
                return Response({"error": "You have not purchased this course."}, status=status.HTTP_403_FORBIDDEN)
            
            if ModuleCompletion.objects.filter(user=user, module=module).exists():
                return Response({"message": "Module already marked as completed."}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                ModuleCompletion.objects.create(user=user, module=module)
                purchase.update_progress()
            except Exception as e:
                return Response({"error": f"Failed to mark completion: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"message": "Module marked as completed."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

"""Handles the CRUD Operations for category"""
class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerialzier
    pagination_class = CustomPagination


    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        try:
            if Category.objects.filter(name=request.data.get('name')).exists():
                raise ValidationError({"error": "Category with this name already exists."})
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                success_url=f'https://skill-bridge-iota.vercel.app/{request.user.role}/courses/success?session_id={{CHECKOUT_SESSION_ID}}&course_title={course.title}',
                cancel_url=f'https://skill-bridge-iota.vercel.app/{request.user.role}/dashboard',
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
            logger.error(f"An error occurred: {e}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class StripeWebhookView(APIView):
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

                tutor_share = course_price * TUTOR_SHARE_PERCENT
                admin_share = course_price * ADMIN_SHARE_PERCENT

                with transaction.atomic():
                    purchase, created = Purchase.objects.get_or_create(
                        user_id=user_id,
                        course_id=course_id,
                         defaults={
                            'stripe_payment_intent_id': session['payment_intent'],
                            'status': 'completed',
                            'purchase_type':'Payment'
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
                        purchase=purchase,
                        amount=tutor_share,
                        transaction_type="credit",
                        description=f"Course sold: {course.title}"
                    )

                    Transaction.objects.create(
                        wallet=admin_wallet,
                        purchase=purchase,
                        amount=admin_share,
                        transaction_type="credit",
                        description=f"Admin commission for course: {course.title}"
                    )

                except Exception as e:
                    logger.error(f"Error updating wallet/transaction: {e}", exc_info=True)
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
                student = get_object_or_404(User, id=user_id)

                chat_room, created = ChatRoom.objects.get_or_create(
                    student=student,
                    tutor=tutor,
                    course=course
                )


                return Response({'status': 'success'}, status=status.HTTP_200_OK)
            
            except IntegrityError:
                return Response({"error": "Duplicate purchase detected"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Webhook Error: {e}", exc_info=True)
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
                purchase.purchase_type = 'Payment'
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
        try:
            course_slug = self.request.query_params.get("course_slug")
            if course_slug:
                course = Course.objects.get(slug=course_slug)
                return course.reviews.all()
            return Review.objects.all()
        except Course.DoesNotExist:
            raise NotFound({"detail": "Course not found."})
        except Exception as e:
            raise APIException(f"An unexpected error occurred: {str(e)}")
    
    def perform_create(self, serializer):
        try:
            course = serializer.validated_data['course']
            user = self.request.user
            if Review.objects.filter(user=user, course=course).exists():
                raise ValidationError({"detail": "You have already reviewed this course."})
            serializer.save(user=user)
        except ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            raise APIException(f"An unexpected error occurred while submitting the review: {str(e)}")


class CommentViewSet(ModelViewSet):

    queryset = Comment.objects.all().select_related("user", "course", "parent").prefetch_related("replies")
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        try:
            course_id = self.request.query_params.get("course")
            if course_id:
                if not Course.objects.filter(id=course_id).exists():
                    raise NotFound({"detail": "Course not found."})
                return Comment.objects.filter(course=course_id, parent=None)
            return Comment.objects.all()
        except Exception as e:
            raise APIException(f"An unexpected error occurred while fetching comments: {str(e)}")
    
    def destroy(self, request, *args, **kwargs):
        """Allows only person who commented to delete their comment"""
        try:
            instance = self.get_object()
            if instance.user != request.user:
                return Response({"detail": "You can only delete your own comments."}, status=403)
            return super().destroy(request, *args, **kwargs)
        except Comment.DoesNotExist:
            raise NotFound({"detail": "Comment not found."})
        except Exception as e:
            raise APIException(f"An unexpected error occurred while deleting the comment: {str(e)}")
        
class CourseTradeViewSet(ModelViewSet):
    queryset = CourseTradeModel.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CourseTradeCreateSerializer
        return CourseTradeRequestSerializer

    def get_queryset(self):
        try:
            user = self.request.user
            return CourseTradeModel.objects.filter(
                Q(requester=user) | Q(accepter=user)
            )
        except Exception as e:
            raise APIException(f"An error occurred while fetching trade requests : {str(e)}")
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            requested_trades = queryset.filter(requester=request.user)
            received_trades = queryset.filter(accepter=request.user)

            requested_serializer = self.get_serializer(requested_trades, many=True)
            received_serializer = self.get_serializer(received_trades, many=True)

            return Response({
                "requested_trade_requests": requested_serializer.data,
                "received_trade_requests": received_serializer.data
            })
        except Exception as e:
            raise APIException(f"An error occurred while listing trade requests: {str(e)}")
    

    def perform_create(self, serializer):
        try:
            requested_course = serializer.validated_data["requested_course"]
            accepter = requested_course.tutor.user
            serializer.save(requester=self.request.user, accepter=accepter)

            notification = Notification.objects.create(
                user = accepter,
                notification_type = "trade_request",
                message=f"You received a new trade request from {self.request.user.get_full_name()}.",
                created_at=timezone.now()  # Explicit timestamp
            )

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notifications_{accepter.id}",
                {
                    "type": "send.notification",
                    "message": notification.message,
                    "notification_type": "trade_request"
                }
            )
        except Exception as e:
            raise APIException(f"An error occurred while creating the trade request. : {str(e)}")

    @action(detail=True, methods=["post"])
    def accept_trade(self,request,pk=None):
        try:
            trade_request = self.get_object()

            if trade_request.requested_course.tutor.user != request.user:
                return Response({"error": "You can only accept trades for your own courses"}, status=status.HTTP_403_FORBIDDEN)
            
            trade_request.status = "accepted"
            trade_request.save()

            Purchase.objects.create(user=trade_request.requester, course=trade_request.requested_course, status="completed", purchase_type="Trade")
            ChatRoom.objects.create(student=trade_request.requester, tutor=request.user, course=trade_request.requested_course)
            Purchase.objects.create(user=request.user, course=trade_request.offered_course, status="completed", purchase_type="Trade")
            ChatRoom.objects.create(student=request.user, tutor=trade_request.requester, course=trade_request.offered_course)

            return Response({"message": "Trade accepted. Both tutors have access to each other's courses."}, status=status.HTTP_200_OK)
        except CourseTradeModel.DoesNotExist:
            raise NotFound({"error": "Trade request not found."})
        except Exception as e:
            raise APIException(f"An error occurred while accepting the trade request: {str(e)}")
    
    @action(detail=True, methods=["post"])
    def decline_trade(self, request, pk=None):
        try:
            trade_request = self.get_object()

            if trade_request.requested_course.tutor.user != request.user:
                return Response({"error": "You can only decline trades for your own courses"}, status=status.HTTP_403_FORBIDDEN)

            trade_request.status = "declined"
            trade_request.save()
            return Response({"message": "Trade declined"}, status=status.HTTP_200_OK)
        except CourseTradeModel.DoesNotExist:
            raise NotFound({"error": "Trade request not found."})
        except Exception as e:
            raise APIException(f"An error occurred while declining the trade request : {str(e)}")
    
class GetChatRoomAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        student_id = self.request.query_params.get("student_id")
        tutor_id = self.request.query_params.get("tutor_id")
        course_id = self.request.query_params.get("course_id")

        if not student_id or not tutor_id or not course_id:
            return Response({'error': 'Missing required parameters'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            chat_room = get_object_or_404(
                ChatRoom,
                student__id=student_id,
                tutor__id=tutor_id,
                course__id=course_id
            )
            serializer = ChatRoomSerializer(chat_room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error occurred: {e}\nTraceback: {traceback.format_exc()}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetChatRoomByIdAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_room_id):
        try:
            chat_room = get_object_or_404(ChatRoom, id=chat_room_id)
            serializer = ChatRoomSerializer(chat_room)
            return Response(serializer.data,  status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class GetUserChatRoomsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, requset, user_id):
        try:
            chat_rooms = ChatRoom.objects.filter(Q(student__id=user_id) | Q(tutor__id=user_id))

            if not chat_rooms.exists():
                return Response({"error": "No chat rooms found for this user"}, status=status.HTTP_404_NOT_FOUND)

            serializer = ChatRoomSerializer(chat_rooms, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        
class GetChatMessageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        chat_room_id = self.request.query_params.get("chat_room_id")

        if not chat_room_id:
            return Response({'error': 'Missing chat_room_id parameter'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            chat_room = get_object_or_404(ChatRoom, id=chat_room_id)
            messages = ChatMessage.objects.filter(chat_room=chat_room)

            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error occurred: {e}\nTraceback: {traceback.format_exc()}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)