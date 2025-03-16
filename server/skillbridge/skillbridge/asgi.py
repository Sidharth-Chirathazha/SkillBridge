"""
ASGI config for skillbridge project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import community.routing
import users.routing
import courses.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillbridge.settings')

application = ProtocolTypeRouter({
    "http":get_asgi_application(),
    "websocket":AuthMiddlewareStack(
        URLRouter(
            community.routing.websocket_urlpatterns + users.routing.websocket_urlpatterns + courses.routing.websocket_urlpatterns
        )
    )
})
