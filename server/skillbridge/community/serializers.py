from rest_framework import serializers
from .models import Community,CommunityMember, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class CommunityMemberSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = CommunityMember
        fields = ['id', 'user', 'full_name', 'joined_at']

class CommunitySerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source="creator.get_full_name", read_only=True)
    members_count = serializers.IntegerField(source="members.count", read_only=True)
    members = serializers.SerializerMethodField()
    thumbnail = serializers.ImageField(required=False)

    class Meta:
        model = Community
        fields = ["id", "creator", "creator_name", "title", "description", "thumbnail", "max_members", "members_count", "created_at", "members"]
        read_only_fields = ["creator"] 

    def validate_thumbnail(self, value):
        if not value:
            raise serializers.ValidationError("Thumbnail is required.")
        return value
    
    def get_members(self, obj):
        community_members = CommunityMember.objects.filter(community=obj)
        return CommunityMemberSerializer(community_members, many=True).data


class UserMessageSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    profile_pic_url = serializers.ImageField(read_only=True)
    role = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "full_name", "profile_pic_url", "role"]

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.get_full_name", read_only=True)
    sender_profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "sender", "sender_name", "sender_profile_pic",  "community", "text", "created_at"]
        read_only_fields = ["sender"]

    def get_sender_profile_pic(self, obj):
        if obj.sender.profile_pic_url:
            return obj.sender.profile_pic_url.url
        return None