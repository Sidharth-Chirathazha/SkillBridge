from celery import shared_task
import redis
import json
from .models import Message, Community
from django.contrib.auth import get_user_model

User = get_user_model()
redis_client =  redis.StrictRedis(host="redis", port=6379, db=0, decode_responses=True)

@shared_task
def sync_messages_to_db():

    for key in redis_client.keys("community_chat_*"):
        community_id = key.split("_")[-1]
        messages = redis_client.lrange(key, 0, -1)

        for message in messages:
            data = json.loads(message)
            sender = User.objects.get(id=data["sender_id"])
            community = Community.objects.get(id=data["community_id"])

            Message.objects.create(
                sender=sender,
                community=community,
                text=data["text"]
            )

        redis_client.delete(key)