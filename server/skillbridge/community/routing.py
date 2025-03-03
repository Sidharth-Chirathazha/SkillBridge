# your_app/routing.py
from django.urls import re_path
from .consumers import CommunityChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/community/(?P<community_id>\d+)/$', CommunityChatConsumer.as_asgi()),
]
