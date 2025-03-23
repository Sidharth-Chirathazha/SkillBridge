import random
import logging
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task

logger = logging.getLogger(__name__)

@shared_task
def sent_otp_email(email, subject):
    try:
        otp = random.randint(100000,999999)
        cache.set(f'otp_{email}', otp, timeout=60)
         # Debug Cache
        stored_otp = cache.get(f'otp_{email}')
        if stored_otp is None:
            logger.warning(f"Failed to store OTP for {email}")
        else:
            logger.info(f"OTP cached successfully for {email}")
        send_mail(
                subject= f"Your OTP for {subject}",
                message=f"Your OTP for {subject} is {otp}. Expires in 1 minute",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
            )
    except Exception as e:
        logger.error(f"Failed to send OTP to {email}: {e}", exc_info=True)
