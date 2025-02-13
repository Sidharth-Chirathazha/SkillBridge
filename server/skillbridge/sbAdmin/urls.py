from django.urls import path,include
from .views import AdminLoginView,AdminLogoutView,AdminDetailsView,AdminTutorViewSet,UpdateUserStatusView,AdminStudentViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'tutors', AdminTutorViewSet, basename='admin-tutors')
router.register(r'students', AdminStudentViewSet, basename='admin-students')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', AdminLoginView.as_view(), name='admin_login'),
    path('logout/', AdminLogoutView.as_view(), name='admin_logout'),
    path('details/', AdminDetailsView.as_view(), name='admin_details'),
    path('users/<int:id>/', UpdateUserStatusView.as_view(), name="update_user_status"),
]
