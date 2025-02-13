from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalletView, TransactionViewSet

router = DefaultRouter()
router.register(r"transactions", TransactionViewSet, basename="transactions")

urlpatterns = [
    path("", include(router.urls)),
     path('user-wallet/', WalletView.as_view(), name='user-wallet'),
]