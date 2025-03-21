# from celery import shared_task
# import redis
# import json
# from .models import ChatMessage, ChatRoom
# from django.contrib.auth import get_user_model

# User = get_user_model()
# redis_client = redis.StrictRedis(host="127.0.0.1", port=6379, db=0, decode_responses=True)

# @shared_task
# def sync_private_messages_to_db():
#     for key in redis_client.keys("private_chat_*"):
#         chat_room_id = key.split("_")[-1]
#         messages = redis_client.lrange(key, 0, -1)

#         for message in messages:
#             print("message in tasks:", message)
#             data = json.loads(message)
#             sender = User.objects.get(id=data["sender_id"])
#             chat_room = ChatRoom.objects.get(id=data["chat_room_id"])

#             ChatMessage.objects.create(
#                 sender=sender,
#                 chat_room=chat_room,
#                 text=data["text"]
#             )

#         redis_client.delete(key)
