from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Wallet, Transaction
from .serializers import WalletSerializer, TransactionSerializer
from rest_framework.generics import RetrieveAPIView
from base.custom_pagination import CustomPagination
from django.shortcuts import get_object_or_404


class WalletView(RetrieveAPIView):

    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Wallet, user=self.request.user)
    
class TransactionViewSet(ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        return Transaction.objects.filter(wallet__user=self.request.user).order_by("-created_at")