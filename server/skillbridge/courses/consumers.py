import json
import redis
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from .models import ChatMessage, ChatRoom
from users.models import Notification
from channels.layers import get_channel_layer
import logging


logger = logging.getLogger(__name__)
User = get_user_model()
redis_client = redis.StrictRedis(host="redis", port=6379, db=0, decode_responses=True)


class PrivateChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        query_string = self.scope["query_string"].decode()
        query_params = dict(qc.split("=") for qc in query_string.split("&") if "=" in qc)
        token = query_params.get("token", None)

        if token:
            try:
                access_token = AccessToken(token)
                self.scope["user"] = await sync_to_async(User.objects.get)(id=access_token["user_id"])
            except Exception:
                self.scope["user"] = AnonymousUser()

        if not self.scope["user"].is_authenticated:
            await self.close(code=4001)
            return

        self.chat_room_id = self.scope['url_route']['kwargs']['chat_room_id']
        self.room_group_name = f"chat_{self.chat_room_id}"

        try:
            chat_room = await sync_to_async(lambda: ChatRoom.objects.select_related("student", "tutor").get(id=self.chat_room_id))()
            if self.scope["user"] not in [chat_room.student, chat_room.tutor]:
                await self.close(code=4003)
                return
        except ChatRoom.DoesNotExist:
            await self.close(code=4004)
            return
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Track user connection count in Redis
        await sync_to_async(redis_client.hincrby)(
            f"chat_room_{self.chat_room_id}_online_users",
            self.scope["user"].id,
            1
        )

        await self.send_presence_update()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            user_id = str(self.scope["user"].id)

            current_count = await sync_to_async(redis_client.hincrby)(
                f"chat_room_{self.chat_room_id}_online_users",
                user_id,
                -1
            )
            
            if current_count <= 0:
                await sync_to_async(redis_client.hdel)(
                    f"chat_room_{self.chat_room_id}_online_users",
                    user_id
            )

            # Send updated presence info
            await asyncio.sleep(0.2)
            await self.send_presence_update()
            
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def send_presence_update(self):
        """Helper to send current online users to group"""
        online_users = await sync_to_async(redis_client.hgetall)(
            f"chat_room_{self.chat_room_id}_online_users"
        )
        online_user_ids = [uid for uid, cnt in online_users.items() if int(cnt) > 0]

        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "presence.update",
                "online_user_ids": online_user_ids
            }
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message')

            if message:
                user = self.scope["user"]

                message_data = {
                    "sender_id": user.id,
                    "chat_room_id": self.chat_room_id,
                    "text": message
                }

                redis_client.lpush(f"private_chat_{self.chat_room_id}", json.dumps(message_data))

                await self.save_message(user.id, message, self.chat_room_id)

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": message,
                        "sender_id": user.id,
                        "sender_name": user.get_full_name(),
                        "sender_profile_pic": user.profile_pic_url.url
                    }
                )
        except Exception as e:
           logger.error(f"WebSocket receive error: {e}", exc_info=True)

    @database_sync_to_async
    def save_message(self, sender_id, message, chat_room_id):
        sender = User.objects.get(id=sender_id)
        chat_room = ChatRoom.objects.get(id=chat_room_id)

        recipient = chat_room.tutor if sender == chat_room.student else chat_room.student

        ChatMessage.objects.create(sender=sender, text=message, chat_room=chat_room)

        notification = Notification.objects.create(
            user=recipient,
            notification_type = "message",
            message = f"New message from {sender.get_full_name()}",
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"notifications_{recipient.id}",
            {
                "type": "send.notification",
                "message": notification.message,
                "notification_type": "message"
            }
        )


    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "sender_id": event["sender_id"],
            "sender_name": event["sender_name"],
            "sender_profile_pic": event["sender_profile_pic"]
        }))

    # Add presence handler
    async def presence_update(self, event):
        """Handle presence updates"""
        await self.send(text_data=json.dumps({
            "type": "presence",
            "online_user_ids": event["online_user_ids"]
        }))

