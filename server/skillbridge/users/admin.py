from django.contrib import admin
from .models import User,Skill,Notification,UserActivity

# Register your models here.
admin.site.register(Skill)
admin.site.register(User)
admin.site.register(Notification)
admin.site.register(UserActivity)

