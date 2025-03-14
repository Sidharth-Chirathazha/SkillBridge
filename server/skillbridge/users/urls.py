from django.urls import path
from .views import UserCreationHandlerView,UserLoginView,UserProfileView,UserLogoutView,GoogleLoginView,SkillListHandleView,CustomTokenRefreshView

urlpatterns = [
    path('register/', UserCreationHandlerView.as_view(), name='user-register'),
    path('verify-otp/', UserCreationHandlerView.as_view(), name='verify-otp'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path('forgot-password/request-otp/', UserCreationHandlerView.as_view(), name='forgot-password-request-otp'),
    path('forgot-password/verify-otp/', UserCreationHandlerView.as_view(), name='forgot-password-verify-otp'),
    path('forgot-password/update-password/', UserCreationHandlerView.as_view(), name='forgot-password-update-password'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/complete/', UserProfileView.as_view(), name='profile-complete'),
    path('skills/', SkillListHandleView.as_view(), name='skill_list_create'),
    path('skills/<int:skill_id>/', SkillListHandleView.as_view(), name='skill_delete'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
]
