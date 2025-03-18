from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from rest_framework.exceptions import APIException
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError
from .serializers import AdminLoginSerializer,AdminTutorSerializer,AdminStudentSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny,IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from users.models import User
from courses.models import Course
from rest_framework.viewsets import ModelViewSet
from base.custom_pagination import CustomPagination
from django.shortcuts import get_object_or_404
from django.db.models import  Q, Value, F, CharField
from django.db.models.functions import Concat
from wallet.models import Wallet, Transaction
from django.db.models import Sum
from django.utils import timezone


# Create your views here.
@method_decorator(csrf_exempt, name='dispatch')
class AdminLoginView(APIView):
    permission_classes =[AllowAny]
    def post(self,request):
        try:
            serializer = AdminLoginSerializer(data=request.data)
            if serializer.is_valid():
                return Response(serializer.validated_data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

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
    serializer_class = AdminTutorSerializer
    pagination_class = CustomPagination

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return[AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        try:
            queryset = User.objects.filter(role="tutor").select_related("tutor_profile").order_by("-created_at")

            active_status = self.request.query_params.get("active_status")
            verified_status = self.request.query_params.get("verified_status")
            search = self.request.query_params.get("search")

            filters = {}

            queryset = queryset.annotate(
                full_name = Concat(F("first_name"), Value(" "), F("last_name"), output_field=CharField())
                )

            if search:
                queryset = queryset.filter(
                Q(full_name__icontains=search) | Q(tutor_profile__cur_job_role__icontains=search)
                )

            if active_status is not None:
                filters["is_active"] = active_status.lower() == "true"

            if verified_status is not None:
                filters["tutor_profile__is_verified"] = verified_status.lower() == "true"

            return queryset.filter(**filters)
        except Exception as e:
            raise APIException(f"An error occurred while fetching tutors: {str(e)}")

    def retrieve(self, request, pk=None):
        try:
            tutor = get_object_or_404(User, id=pk, role="tutor")
            serializer = self.get_serializer(tutor)
            return Response(serializer.data)
        except Http404:
            return Response({"error": "Tutor not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def partial_update(self, request, pk=None):
        """Handles partial updates (PATCH) for tutor verification"""
        try:
            tutor = get_object_or_404(User, id=pk, role="tutor")
            is_verified = request.data.get("is_verified")

            if is_verified is not None:
                tutor.tutor_profile.is_verified = is_verified
                tutor.tutor_profile.save()
                return Response({"detail": f"Tutor {'authorized' if is_verified else 'unauthorized'} successfully."})

            return Response({"detail": "Invalid data."}, status=400)
        except Http404:
            return Response({"error": "Tutor not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class AdminStudentViewSet(ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = AdminStudentSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        try:
            queryset = User.objects.filter(role="student").order_by("-created_at")

            active_status = self.request.query_params.get("active_status")
            search = self.request.query_params.get("search")

            filters = {}

            queryset = queryset.annotate(
                full_name = Concat(F("first_name"), Value(" "), F("last_name"), output_field=CharField())
                )

            if search:
                queryset = queryset.filter(
                Q(full_name__icontains=search)
                )
            
            if active_status is not None:
                filters["is_active"] = active_status.lower() == "true"

            return queryset.filter(**filters)
        
        except Exception as e:
            raise APIException(f"An error occurred while fetching students: {str(e)}")

    def retrieve(self, request, pk=None):
        try:
            student = get_object_or_404(User, id=pk, role="student")
            serializer = self.get_serializer(student)
            return Response(serializer.data)
        except Http404:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    
class UpdateUserStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, id=None):
        if not id:
            return Response({"detail": "Tutor ID/Student ID is required."}, status=400)
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            raise Http404("Tutor/Student not found.")
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        is_active = request.data.get("is_active")
        if is_active is not None:
            try:
                user.is_active = is_active
                user.save()
                status_message = "blocked" if not is_active else "unblocked"
                return Response({"detail": f"User {status_message} successfully."}, status=status.HTTP_200_OK)
            except ValidationError as e:
                return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"detail": "Invalid data."}, status=400)
    

    
class AdminDashboardSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):

        try:
            user = request.user

            admin_wallet = Wallet.objects.filter(user=user).first()
            admin_earnings = admin_wallet.balance if admin_wallet else 0.00

            total_sales = Wallet.objects.aggregate(Sum('balance'))['balance__sum'] or 0.00

            if total_sales > 0:
                admin_share_percentage = (admin_earnings / total_sales) * 100
                tutor_share_percentage = 100 - admin_share_percentage  # Remaining goes to tutors
            else:
                admin_share_percentage = 0.00
                tutor_share_percentage = 0.00
            
            data = {
                "total_students" : User.objects.filter(role="student").count(),
                "total_tutors" : User.objects.filter(role="tutor").count(),
                "total_courses" : Course.objects.all().count(),
                "total_earnings": admin_earnings,
                "total_sales":total_sales,
                "admin_share_percentage": round(admin_share_percentage, 2),  # Corrected calculation
                "tutor_share_percentage": round(tutor_share_percentage, 2)   # Corrected calculation
            }
            return Response(data)
        except ObjectDoesNotExist:
            return Response({"detail": "Data not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class GlobalSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            data = {
                "total_students" : User.objects.filter(role="student").count(),
                "total_tutors" : User.objects.filter(role="tutor").count(),
                "total_courses" : Course.objects.all().count()
            }
            return Response(data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminEarningsOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
           user = request.user
           timeframe = request.query_params.get('timeframe', 'week')

           try:
               admin_wallet = user.wallet
           except Wallet.DoesNotExist:
               return Response({"error": "Wallet not found"}, status=status.HTTP_400_BAD_REQUEST)
           
           admin_transactions = Transaction.objects.filter(wallet=admin_wallet, transaction_type="credit")

           all_transactions = Transaction.objects.filter(transaction_type="credit")

           today = timezone.now()

           if timeframe == "day":
               start_date = today - timezone.timedelta(days=1)
               admin_transactions = admin_transactions.filter(created_at__gte=start_date)
               all_transactions = all_transactions.filter(created_at__gte=start_date)

               # Create empty chart data structure
               chart_data = [
                    {"name": "12AM", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "4AM", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "8AM", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "12PM", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "4PM", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "8PM", "adminEarnings": 0.0, "totalSales": 0.0}
                ]
               
               # Process admin transactions
               for transaction in admin_transactions:
                    hour = transaction.created_at.hour
                    amount = float(transaction.amount)
                    
                    # Assign to the correct time period
                    if 0 <= hour < 4:
                        chart_data[0]["adminEarnings"] += amount
                    elif 4 <= hour < 8:
                        chart_data[1]["adminEarnings"] += amount
                    elif 8 <= hour < 12:
                        chart_data[2]["adminEarnings"] += amount
                    elif 12 <= hour < 16:
                        chart_data[3]["adminEarnings"] += amount
                    elif 16 <= hour < 20:
                        chart_data[4]["adminEarnings"] += amount
                    else:  # 20 <= hour < 24
                        chart_data[5]["adminEarnings"] += amount
                
               # Process all transactions (total sales)
               for transaction in all_transactions:
                    hour = transaction.created_at.hour
                    amount = float(transaction.amount)
                    
                    # Assign to the correct time period
                    if 0 <= hour < 4:
                        chart_data[0]["totalSales"] += amount
                    elif 4 <= hour < 8:
                        chart_data[1]["totalSales"] += amount
                    elif 8 <= hour < 12:
                        chart_data[2]["totalSales"] += amount
                    elif 12 <= hour < 16:
                        chart_data[3]["totalSales"] += amount
                    elif 16 <= hour < 20:
                        chart_data[4]["totalSales"] += amount
                    else:  # 20 <= hour < 24
                        chart_data[5]["totalSales"] += amount
           elif timeframe == "week":
                # Last 7 days
                start_date = today - timezone.timedelta(days=6)
                admin_transactions = admin_transactions.filter(created_at__gte=start_date)
                all_transactions = all_transactions.filter(created_at__gte=start_date)
                
                chart_data = [
                    {"name": "Mon", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "Tue", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "Wed", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "Thu", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "Fri", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "Sat", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "Sun", "adminEarnings": 0.0, "totalSales": 0.0}
                ]
                
                # Process admin transactions
                for transaction in admin_transactions:
                    day_idx = transaction.created_at.weekday()
                    chart_data[day_idx]["adminEarnings"] += float(transaction.amount)
                
                # Process all transactions
                for transaction in all_transactions:
                    day_idx = transaction.created_at.weekday()
                    chart_data[day_idx]["totalSales"] += float(transaction.amount)
                
           elif timeframe == "month":
                # Last 4 weeks
                start_date = today - timezone.timedelta(weeks=4)
                admin_transactions = admin_transactions.filter(created_at__gte=start_date)
                all_transactions = all_transactions.filter(created_at__gte=start_date)
                
                chart_data = [
                    {"name": "Week 1", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "Week 2", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "Week 3", "adminEarnings": 0.0, "totalSales": 0.0},
                    {"name": "Week 4", "adminEarnings": 0.0, "totalSales": 0.0}
                ]
                
                # Process admin transactions
                for transaction in admin_transactions:
                    days_ago = (today - transaction.created_at).days
                    week_idx = min(3, days_ago // 7)
                    chart_data[week_idx]["adminEarnings"] += float(transaction.amount)
                
                # Process all transactions
                for transaction in all_transactions:
                    days_ago = (today - transaction.created_at).days
                    week_idx = min(3, days_ago // 7)
                    chart_data[week_idx]["totalSales"] += float(transaction.amount)
                
           elif timeframe == "year":
                # Last 12 months
                start_date = (today - timezone.timedelta(days=365)).replace(day=1)
                admin_transactions = admin_transactions.filter(created_at__gte=start_date)
                all_transactions = all_transactions.filter(created_at__gte=start_date)
                
                months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                
                chart_data = [{"name": month, "adminEarnings": 0.0, "totalSales": 0.0} for month in months]
                
                # Process admin transactions
                for transaction in admin_transactions:
                    month_idx = transaction.created_at.month - 1
                    chart_data[month_idx]["adminEarnings"] += float(transaction.amount)
                
                # Process all transactions
                for transaction in all_transactions:
                    month_idx = transaction.created_at.month - 1
                    chart_data[month_idx]["totalSales"] += float(transaction.amount)
                
           else:
                return Response({"error": "Invalid timeframe"}, status=400)

           return Response({"chart_data": chart_data})