import random
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings


def generate_email_otp(email, subject):

    otp = random.randint(100000,999999)
    cache.set(f'otp_{email}', otp, timeout=30)
    send_mail(
            subject= f"Your OTP for {subject}",
            message=f"Your OTP for {subject} is {otp}. Expires in 2 minutes",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
        )
