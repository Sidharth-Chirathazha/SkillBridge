from django.contrib import admin
from .models import Community,CommunityMember,Message

# Register your models here.

admin.site.register(Community)
admin.site.register(CommunityMember)
admin.site.register(Message)
