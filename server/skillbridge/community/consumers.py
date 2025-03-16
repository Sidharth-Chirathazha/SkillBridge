import json
import redis
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import CommunityMember, Community
from asgiref.sync import sync_to_async
import asyncio
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser


User = get_user_model()
redis_client =  redis.StrictRedis(host="127.0.0.1", port=6379, db=0, decode_responses=True)

class CommunityChatConsumer(AsyncWebsocketConsumer):

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

        if not self.scope["user"].is_authenticated:
            await self.close(code=4001)
            return
        
        self.community_id = self.scope['url_route']['kwargs']['community_id']
        self.room_group_name = f"chat_{self.community_id}"

        try:
            community = await Community.objects.aget(id=self.community_id)
            is_member = await CommunityMember.objects.filter(
                user = self.scope["user"],
                community = community
            ).aexists()

            if not is_member:
                await self.close(code=4003)
                return
            
        except Community.DoesNotExist:
            await self.close(code=4004)
            return
        
        """Tracking online users in redis"""
        user_id = str(self.scope["user"].id)
        redis_client.sadd(f"community_online_{self.community_id}", user_id)
        
        """Adding user to the websocket channel group"""
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        """Notifying all members about online users"""
        await self.broadcast_online_users()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        """Removing users from online list in redis"""
        user_id = str(self.scope["user"].id)
        redis_client.srem(f"community_online_{self.community_id}", user_id)

        await asyncio.sleep(0.2)
        await self.broadcast_online_users()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        sender = self.scope['user'].first_name if self.scope['user'].is_authenticated else "Anonymous"

        if message:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender
                }
        )
    
    async def chat_message(self, event):
    # Send full message data with sender ID
        await self.send(text_data=json.dumps({
            "type": "chat_message",  # Include the type field
            "message": event["message"]
        }))


    async def broadcast_online_users(self):
        """Get list of online user id's from redis"""
        online_user_ids = [str(uid) for uid in redis_client.smembers(f"community_online_{self.community_id}")]

        """Fetching user details asynchronously"""
        users = await database_sync_to_async(list)(
            User.objects.filter(id__in=online_user_ids).values("id", "first_name")
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "online_users",
                "users": users
            }
        )

    async def online_users(self, event):
        """Send online users list to the WebSocket client"""
        await self.send(text_data=json.dumps(
            {
                "type": "online_users",
                "users": event["users"]
            }
        ))