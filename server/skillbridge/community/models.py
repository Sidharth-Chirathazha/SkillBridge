from django.db import models
from django.contrib.auth import get_user_model
import cloudinary
import cloudinary.uploader
import cloudinary.models

User = get_user_model()

# Create your models here.

class Community(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_communities")
    title = models.CharField(max_length=250, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    thumbnail = cloudinary.models.CloudinaryField('image', blank=True, null=True)
    max_members = models.PositiveIntegerField(default=50)
    members = models.ManyToManyField(User, related_name="joined_communities", through="CommunityMember")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class CommunityMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'community')


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="messages")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)