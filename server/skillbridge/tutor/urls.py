from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import TutorReviewViewSet, TutorDashBoardSummaryAPIView, EarningsOverviewView, PurchaseDetailsView

router = DefaultRouter()
router.register(r'tutor-reviews', TutorReviewViewSet, basename='tutor-reviews')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-summary/', TutorDashBoardSummaryAPIView.as_view(), name='dashboard_summary'),
    path('earnings-overview/', EarningsOverviewView.as_view(), name='earnings_overview'),
    path('purchase-details/', PurchaseDetailsView.as_view(), name='purchase_details'),
]