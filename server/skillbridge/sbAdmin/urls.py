from django.urls import path
from .views import AdminLoginView,AdminLogoutView,AdminDetailsView,AdminTutorListView,UpdateUserStatusView,AdminStudentListView

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin_login'),
    path('logout/', AdminLogoutView.as_view(), name='admin_logout'),
    path('details/', AdminDetailsView.as_view(), name='admin_details'),
    path('tutors/', AdminTutorListView.as_view(), name='admin_tutors_list'),
    path('tutors/<int:id>/', AdminTutorListView.as_view(), name='admin_tutor_detail'),
    path('students/', AdminStudentListView.as_view(), name='admin_students_list'),
    path('students/<int:id>/', AdminStudentListView.as_view(), name='admin_student_detail'),
    path('users/<int:id>/', UpdateUserStatusView.as_view(), name="update_user_status"),
]
