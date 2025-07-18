"""
Django settings for skillbridge project.

Generated by 'django-admin startproject' using Django 5.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
import os

 

load_dotenv()


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(os.getenv('DEBUG'))

ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '').split()

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser', 
        'rest_framework.parsers.FormParser',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=10),  
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=300),  
    'ROTATE_REFRESH_TOKENS': False,                
    'BLACKLIST_AFTER_ROTATION': True,             
    'ALGORITHM': 'HS256',                          
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}


AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend', 
]

# Application definition

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'django_celery_beat',
    'users',
    'tutor',
    'student',
    'sbAdmin',
    'courses',
    'wallet',
    'chatbot',
    'cloudinary',
    'cloudinary_storage',
    'community',
    'rest_framework',
    'corsheaders',
    'django_extensions',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'django.contrib.sites',  
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth.registration',
]

AUTH_USER_MODEL = 'users.User'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',

]

ROOT_URLCONF = 'skillbridge.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'skillbridge.wsgi.application'
ASGI_APPLICATION = 'skillbridge.asgi.application'

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://redis:6379/0',
    }
}

CELERY_BROKER_URL = 'redis://redis:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True



# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE'),
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True  # Enable SSL for secure communication
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')  # Your Gmail address
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')  # App Password or Gmail password



# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SITE_ID = 1

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'secret': os.getenv('GOOGLE_CLIENT_SECRET'),
            'key': ''
        }
    }
}

# Add the following in your settings.py

# This tells Django to use the default redirect page after login
LOGIN_REDIRECT_URL = '/'

# Define the URL for social login provider (Google in this case)
SOCIAL_AUTH_GOOGLE_OAUTH2_CALLBACK_URL = 'https://api.skillbridge.fun/accounts/google/login/callback/'

SOCIAL_AUTH_REDIRECT_IS_HTTPS = True


# This setting is needed if you're using the allauth views for login/logout
ACCOUNT_AUTHENTICATED_REDIRECT_URL = '/'  # URL to redirect after successful login

STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

GEMINI_API_KEY=os.getenv('GEMINI_API_KEY')

AUTH_USER_MODEL = 'users.User'


ZEGO_APP_ID =  os.getenv('ZEGO_APP_ID')
ZEGO_SERVER_SECRET =  os.getenv('ZEGO_SERVER_SECRET')


CORS_ALLOWED_ORIGINS = [
    "https://www.skillbridge.fun",
]



CORS_ALLOW_METHODS = ["GET", "POST", "OPTIONS", "DELETE", "PUT", "PATCH"]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://(\w+\.)?skillbridge\.fun$",
]




