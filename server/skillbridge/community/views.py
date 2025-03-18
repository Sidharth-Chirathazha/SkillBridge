import redis
import json
import logging
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Community, Message, CommunityMember
from .serializers import CommunitySerializer, MessageSerializer, UserMessageSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from users.models import Notification
from base.custom_pagination import CustomPagination
from django.db.models import  Q

# Create your views here.

redis_client = redis.StrictRedis(host="127.0.0.1", port=6379, db=0, decode_responses=True)
logger = logging.getLogger(__name__)

class CommunityViewSet(ModelViewSet):
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = CustomPagination

    print("Inside community view set")

    def get_queryset(self):
        try:
            user = self.request.user
            queryset = Community.objects.all()

            if not user.is_staff:  # Regular users get only active communities
                queryset = queryset.filter(is_active=True)

            search = self.request.query_params.get('search')

            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search)
                )
            return queryset
        except Community.DoesNotExist:
             return Response({"error": "Community not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "An error occurred while fetching communities.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        try:
            if not serializer.is_valid():
                print("serializer errors:", serializer.errors)
            community = serializer.save(creator=self.request.user)

            CommunityMember.objects.create(user=self.request.user, community=community)
        except Exception as e:
            return Response({"detail": "An error occurred while creating the community ", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def update(self, request, *args, **kwargs):
        if not request.user.is_staff:  # Ensure only admins can update is_active status
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=["POST"])
    def join_community(self, request, pk=None):
        try:
            community = self.get_object()

            if CommunityMember.objects.filter(user=request.user, community=community).exists():
                return Response({"detail": "You are already a member."}, status=status.HTTP_400_BAD_REQUEST)
            
            if community.members.count() >= community.max_members:
                return Response({"detail": "Community member limit reached."}, status=status.HTTP_400_BAD_REQUEST)
            
            CommunityMember.objects.create(user=request.user, community=community)
            return Response({
                "communityId": community.id,
                "userId": request.user.id,
                "detail": "You have successfully joined the community."
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": "An error occurred while joining the community.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    
    @action(detail=True, methods=["POST"])
    def leave_community(self, request, pk=None):
        try:
            community = self.get_object()

            membership = CommunityMember.objects.filter(user=request.user, community=community).first()

            if not membership:
                return Response({"detail": "You are not a member of this community."}, status=status.HTTP_400_BAD_REQUEST)
            
            membership.delete()
            return Response({"detail": "You have left the community."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": "An error occurred while leaving the community.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=["GET"], permission_classes=[IsAuthenticated])
    def members(self, request, pk=None):
        """Fetching memebers of a specific community"""
        try:
            community = self.get_object()
            members = community.members.all()
            serializer = UserMessageSerializer(members, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": "An error occurred while fetching the members.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            queryset = super().get_queryset()
            community_id = self.request.query_params.get('community')
            if community_id:
                queryset = queryset.filter(community=community_id)
            return queryset.order_by('created_at')
        except Message.DoesNotExist:
             return Response({"error": "Messages not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "An error occurred while fetching Messages.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    def perform_create(self, serializer):
        try:
            community = serializer.validated_data["community"]
            if not CommunityMember.objects.filter(user=self.request.user, community=community).exists():
                raise PermissionError("You are not a member of this community.")
            message = serializer.save(sender=self.request.user)
            
            try:
                members = CommunityMember.objects.filter(community=community).exclude(user=self.request.user)
                message_data = MessageSerializer(message).data

                notifications = [
                    Notification(user=member.user, notification_type="message", message=f"New message in {community.title} from {self.request.user.get_full_name()}")
                    for member in members
                ]

                Notification.objects.bulk_create(notifications)
            except Exception as e:
                logger.error(f"Notification creation failed for community '{community.title}': {e}", exc_info=True)
                return Response({"detail": "Failed to send notifications. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            try:
                channel_layer = get_channel_layer()
                for member in members:
                    async_to_sync(channel_layer.group_send)(
                    f"notifications_{member.user.id}",
                    {
                        "type": "send.notification",
                        "message": f"New message in {community.title}",
                        "notification_type": "message"
                    }
                )
            except Exception as e:
                logger.error(f"WebSocket notification failed for community '{community.title}': {e}", exc_info=True)
            
            try:
                redis_client.publish(
                    f"community_{community.id}", 
                    json.dumps(message_data)
                )
            except Exception as e:
                logger.error(f"Failed to publish message to Redis for community '{community.title}': {e}", exc_info=True)

            try:
                async_to_sync(get_channel_layer().group_send)(
                    f"chat_{community.id}",
                    {
                        "type": "chat.message",
                        "message": {
                            "id": message.id,
                            "text": message.text,
                            "sender": message.sender.id,
                            "created_at": message.created_at.isoformat(),
                            "sender_name": message.sender.get_full_name(),
                            "sender_profile_pic": message.sender.profile_pic_url.url if message.sender.profile_pic_url else None
                        }
                    }
                )
            except Exception as e:
                logger.error(f"Failed to send chat message for community '{community.title}': {e}", exc_info=True)

            return Response(message_data, status=status.HTTP_201_CREATED)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)

        except Exception as e:
            logger.critical(f"Unexpected error during message creation: {e}", exc_info=True)
            return Response({"detail": "An unexpected error occurred while sending the message.", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)