from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet,CourseViewSet,ModuleViewSet,CreateCheckoutSession,StripeWebhookView,VerifyPurchase,PurchasedCoursesViewSet,ReviewViewSet,CommentViewSet, CourseTradeViewSet, GetChatRoomAPIView, GetChatMessageAPIView, GetChatRoomByIdAPIView, GetUserChatRoomsAPIView

"""Created a router and resgistered the CategoryViewSet, CourseViewSet"""
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'course', CourseViewSet, basename='course')
router.register(r'modules', ModuleViewSet, basename='module')
router.register(r'purchased-courses', PurchasedCoursesViewSet, basename='purchased-courses')
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r"course-trades", CourseTradeViewSet, basename="course-trade")

urlpatterns = [
    path('', include(router.urls)),
    path('create-checkout-session/', CreateCheckoutSession.as_view(), name='create-checkout-session'),
    path('verify-purchase/', VerifyPurchase.as_view(), name='verify-purchase'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('user/chat-rooms/<int:user_id>/', GetUserChatRoomsAPIView.as_view(), name='get-user-chatrooms'),
    path('chat-room/', GetChatRoomAPIView.as_view(), name='get-chat-room'),
    path('chat-room/<int:chat_room_id>/', GetChatRoomByIdAPIView.as_view(), name='get-chat-room-by-id'),
    path('chat-room/messages/', GetChatMessageAPIView.as_view(), name='get-chat-room-messages'),
]