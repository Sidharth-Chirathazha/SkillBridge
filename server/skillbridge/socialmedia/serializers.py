from rest_framework import serializers
from .models import SocialMediaPlatform

class SocialMediaPlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMediaPlatform
        fields = ['platform', 'profile_url']