from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser if none exists'

    def handle(self, *args, **options):
        if not User.objects.filter(is_superuser=True).exists():
            email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
            password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
            
            try:
                User.objects.create_superuser(
                    email=email,
                    password=password
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Superuser with email "{email}" created successfully!')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating superuser: {str(e)}')
                )
        else:
            self.stdout.write(
                self.style.WARNING('Superuser already exists. Skipping creation.')
            )