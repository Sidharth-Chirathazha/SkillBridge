from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.exceptions import ValidationError
from .serializers import TutorReviewSerializer
from .models import TutorProfile, TutorReview
from rest_framework.views import APIView
from rest_framework.response import Response
from courses.models import Course, Purchase
from wallet.models import Wallet, Transaction
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear, TruncHour
from datetime import timedelta
from django.utils import timezone
from base.constants import TUTOR_SHARE_PERCENT
from decimal import Decimal
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
            try:
                tutor = TutorProfile.objects.get(id=tutor_id)
                return tutor.reviews.all()
            except ObjectDoesNotExist as e:
                raise NotFound({"detail": f"Tutor not found: {e}"})
            except ValueError as e:
                raise ValidationError({"detail": f"Invalid tutor ID: {e}"})
            
        return TutorReview.objects.all()
    
    def perform_create(self, serializer):
        try:
            tutor = serializer.validated_data['tutor']
            user = self.request.user
            if TutorReview.objects.filter(user=user, tutor=tutor).exists():
                raise ValidationError({"detail": "You have already reviewed this tutor."})
            serializer.save(user=user)
        except KeyError:
            raise ValidationError({"detail": "Tutor field is required."})

"""View to show dashboard stats of tutor"""
class TutorDashBoardSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        try:
            tutor_profile = user.tutor_profile
        except AttributeError:
            return Response({"error": "User is not a tutor"}, status=403)
        
        try:
            tutor_courses = Course.objects.filter(tutor=tutor_profile)
            total_courses = tutor_courses.count()

            student_ids = set(
                Purchase.objects.filter(course__in=tutor_courses).values_list("user_id", flat=True)
            )
            total_students = len(student_ids)

            total_purchases = Purchase.objects.filter(course__in=tutor_courses).count()

            trade_count = Purchase.objects.filter(course__in=tutor_courses, purchase_type="Trade").count()
            payment_count = Purchase.objects.filter(course__in=tutor_courses, purchase_type="Payment").count()

            trade_percent = (trade_count / total_purchases) * 100 if total_purchases > 0 else 0
            purchase_percent = (payment_count / total_purchases) * 100 if total_purchases > 0 else 0

            wallet = Wallet.objects.filter(user=user).first()
            total_earnings = wallet.balance if wallet else 0.00

            return Response({
                "total_courses" : total_courses,
                "total_students": total_students,
                "total_earnings": total_earnings,
                "trade_percent": round(trade_percent, 2),
                "purchase_percent": round(purchase_percent, 2)

            })
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)
    

"""View to show the Earnings Overview Chart Data"""
class EarningsOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        timeframe = request.query_params.get('timeframe', 'week')
        
        try:
            wallet = user.wallet
        except Wallet.DoesNotExist:
            return Response({"error": "Wallet not found"}, status=400)
        
        try:
            # Get credit transactions for this wallet
            transactions = Transaction.objects.filter(wallet=wallet, transaction_type="credit")
            
            # Get the current date
            today = timezone.now()
            
            # Filter transactions based on timeframe
            if timeframe == "day":
                # Last 24 hours data divided by 6 periods
                start_date = today - timezone.timedelta(days=1)
                transactions = transactions.filter(created_at__gte=start_date)
                
                # Create empty chart data structure
                chart_data = [
                    {"name": "12AM", "earnings": 0.0},
                    {"name": "4AM", "earnings": 0.0},
                    {"name": "8AM", "earnings": 0.0},
                    {"name": "12PM", "earnings": 0.0},
                    {"name": "4PM", "earnings": 0.0},
                    {"name": "8PM", "earnings": 0.0}
                ]
                
                # Process each transaction individually to ensure correct time assignment
                for transaction in transactions:
                    hour = transaction.created_at.hour
                    amount = float(transaction.amount)
                    
                    # Assign to the correct time period
                    if 0 <= hour < 4:
                        chart_data[0]["earnings"] += amount
                    elif 4 <= hour < 8:
                        chart_data[1]["earnings"] += amount
                    elif 8 <= hour < 12:
                        chart_data[2]["earnings"] += amount
                    elif 12 <= hour < 16:
                        chart_data[3]["earnings"] += amount
                    elif 16 <= hour < 20:
                        chart_data[4]["earnings"] += amount
                    else:  # 20 <= hour < 24
                        chart_data[5]["earnings"] += amount
                    
                    # Debug print
                    print(f"Transaction at {transaction.created_at}, hour: {hour}, amount: {amount}, assigned to: {chart_data[hour // 4]['name']}")
                    
            elif timeframe == "week":
                # Last 7 days
                start_date = today - timezone.timedelta(days=6)
                transactions = transactions.filter(created_at__gte=start_date)
                
                chart_data = [
                    {"name": "Mon", "earnings": 0.0},
                    {"name": "Tue", "earnings": 0.0},
                    {"name": "Wed", "earnings": 0.0},
                    {"name": "Thu", "earnings": 0.0},
                    {"name": "Fri", "earnings": 0.0},
                    {"name": "Sat", "earnings": 0.0},
                    {"name": "Sun", "earnings": 0.0}
                ]
                
                for transaction in transactions:
                    # Get the day of week (0 = Monday, 6 = Sunday)
                    day_idx = transaction.created_at.weekday()
                    chart_data[day_idx]["earnings"] += float(transaction.amount)
                    
            elif timeframe == "month":
                # Last 4 weeks
                start_date = today - timezone.timedelta(weeks=4)
                transactions = transactions.filter(created_at__gte=start_date)
                
                chart_data = [
                    {"name": "Week 1", "earnings": 0.0},
                    {"name": "Week 2", "earnings": 0.0},
                    {"name": "Week 3", "earnings": 0.0},
                    {"name": "Week 4", "earnings": 0.0}
                ]
                
                for transaction in transactions:
                    # Calculate which week this transaction belongs to
                    days_ago = (today - transaction.created_at).days
                    week_idx = min(3, days_ago // 7)
                    chart_data[week_idx]["earnings"] += float(transaction.amount)
                    
            elif timeframe == "year":
                # Last 12 months
                start_date = (today - timezone.timedelta(days=365)).replace(day=1)
                transactions = transactions.filter(created_at__gte=start_date)
                
                months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                
                chart_data = [{"name": month, "earnings": 0.0} for month in months]
                
                for transaction in transactions:
                    # Get the month index (0 = Jan, 11 = Dec)
                    month_idx = transaction.created_at.month - 1
                    chart_data[month_idx]["earnings"] += float(transaction.amount)
                    
            else:
                return Response({"error": "Invalid timeframe"}, status=400)

            return Response({"chart_data": chart_data})
        
        except Exception as e:
            return Response({"error": "An unexpected error occurred", "details": str(e)}, status=500)
    

class PurchaseDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            timeframe = request.query_params.get('timeframe', 'week')


            # Get the current date
            today = timezone.now()

            # Filter date range based on timeframe
            if timeframe == "day":
                start_date = today - timezone.timedelta(days=1)
            elif timeframe == "week":
                start_date = today - timezone.timedelta(days=7)
            elif timeframe == "month":
                start_date = today - timezone.timedelta(days=30)
            elif timeframe == "year":
                start_date = today - timezone.timedelta(days=365)
            else:
                return Response({"error": "Invalid timeframe"}, status=400)

            # Get purchases where the request user is the tutor
            if user.is_superuser:
                purchases_queryset = Purchase.objects.filter(
                    created_at__gte=start_date,
                ).select_related('course', 'user')
            else:
                tutor_profile = TutorProfile.objects.get(user=user)
                purchases_queryset = Purchase.objects.filter(
                    created_at__gte=start_date,
                    course__tutor=tutor_profile  # Ensures we get purchases where the request user is the tutor
                ).select_related('course', 'user')

            # Format detailed purchase data
            purchases = []
            for purchase in purchases_queryset:
                course_name = purchase.course.title if purchase.course else "N/A"
                user_name = purchase.user.get_full_name() if purchase.user else "N/A"
                course_price = float(purchase.course.price) if purchase.course else 0.0
                user_wallet = Wallet.objects.get(user=user) 
                credited_amount = Transaction.objects.filter(
                    purchase=purchase, 
                    transaction_type="credit", 
                    wallet=user_wallet  # Filters transactions for the user's wallet
                ).aggregate(Sum('amount'))['amount__sum'] or 0.0
                opposite_share = round(Decimal(course_price) - Decimal(credited_amount), 2)

                purchase_data = {
                    "course_name": course_name,
                    "user_name": user_name,
                    "purchase_date": purchase.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "purchase_type": purchase.purchase_type,  # "trade" or "payment"
                    "course_price": course_price,
                    "credited_amount": credited_amount,
                    "opposite_share":opposite_share if purchase.purchase_type == "Payment" else 0
                }
                purchases.append(purchase_data)

            return Response({"purchases": purchases})
        
        except TutorProfile.DoesNotExist:
            return Response({"error": "Tutor profile not found"}, status=404)
        except Wallet.DoesNotExist:
            return Response({"error": "Wallet not found"}, status=404)
        except Purchase.DoesNotExist:
            return Response({"error": "Purchase not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)