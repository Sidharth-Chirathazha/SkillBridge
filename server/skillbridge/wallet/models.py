from django.db import models
from django.contrib.auth import get_user_model
from courses.models import Purchase
User = get_user_model()

# Create your models here.

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
         return f"{self.user.first_name} {self.user.last_name} - Wallet Balance: {self.balance}"
    
class Transaction(models.Model):
    
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name="transactions", null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10,choices=[('credit', 'Credit'), ('debit', 'Debit')])
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.wallet.user.first_name} - {self.transaction_type} - {self.amount}"