import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):

        query_string = self.scope["query_string"].decode()
        query_params = dict(qc.split("=") for qc in query_string.split("&") if "=" in qc)
        token = query_params.get("token", None)

        if token:
            try:
                access_token = AccessToken(token)
                self.scope["user"] = await database_sync_to_async(User.objects.get)(id=access_token["user_id"])
            except Exception:
                self.scope["user"] = AnonymousUser()


        if self.scope["user"].is_authenticated:
            self.group_name = f"notifications_{self.scope['user'].id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.scope["user"].is_authenticated:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    
    async def send_notification(self,event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "notification_type": event["notification_type"]
        }))