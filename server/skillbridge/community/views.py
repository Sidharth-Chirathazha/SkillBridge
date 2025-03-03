import redis
import json
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Community, Message, CommunityMember
from .serializers import CommunitySerializer, MessageSerializer, UserMessageSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

# Create your views here.

redis_client = redis.StrictRedis(host="127.0.0.1", port=6379, db=0, decode_responses=True)

class CommunityViewSet(ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    print("Inside community view set")

    def perform_create(self, serializer):
        print("Received Data:", self.request.data)
        if not serializer.is_valid():
            print("serializer errors:", serializer.errors)
        community = serializer.save(creator=self.request.user)

        CommunityMember.objects.create(user=self.request.user, community=community)

    @action(detail=True, methods=["POST"])
    def join_community(self, request, pk=None):

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
        
    
    @action(detail=True, methods=["POST"])
    def leave_community(self, request, pk=None):
        community = self.get_object()

        membership = CommunityMember.objects.filter(user=request.user, community=community).first()

        if not membership:
            return Response({"detail": "You are not a member of this community."}, status=status.HTTP_400_BAD_REQUEST)
        
        membership.delete()
        return Response({"detail": "You have left the community."}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["GET"], permission_classes=[IsAuthenticated])
    def members(self, request, pk=None):
        """Fetching memebers of a specific community"""
        community = self.get_object()
        members = community.members.all()
        serializer = UserMessageSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        community_id = self.request.query_params.get('community')
        if community_id:
            queryset = queryset.filter(community=community_id)
        return queryset.order_by('created_at')

    def perform_create(self, serializer):
        community = serializer.validated_data["community"]
        if not CommunityMember.objects.filter(user=self.request.user, community=community).exists():
            raise PermissionError("You are not a member of this community.")
        message = serializer.save(sender=self.request.user)
        
        message_data = MessageSerializer(message).data
        
        redis_client.publish(
            f"community_{community.id}", 
            json.dumps(message_data)
        )

        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer

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

        return Response(message_data, status=status.HTTP_201_CREATED)