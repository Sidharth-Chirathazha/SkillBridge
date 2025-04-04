from django.urls import re_path
from .consumers import PrivateChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<chat_room_id>\d+)/$', PrivateChatConsumer.as_asgi()),
]
