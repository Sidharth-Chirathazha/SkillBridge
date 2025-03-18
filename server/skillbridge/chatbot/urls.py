from django.urls import path,include
from .views import ChatbotView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chat-bot-chat'),
]