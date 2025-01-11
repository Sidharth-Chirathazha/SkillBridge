from django.urls import path
from .views import UserLoginView,UserCreationView,OtpVerificationView,UserProfileView

urlpatterns = [
    path('register/', UserCreationView.as_view(), name='user-register'),
    path('verify-otp/', OtpVerificationView.as_view(), name='verify-otp'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/complete/', UserProfileView.as_view(), name='profile-complete'),
]
