from django.contrib import admin
from .models import Course,Category,Module,Purchase,Review,CourseTradeModel,Comment,ModuleCompletion, ChatMessage, ChatRoom

# Register your models here.

admin.site.register(Course)
admin.site.register(Category)
admin.site.register(Module)
admin.site.register(Purchase)
admin.site.register(Review)
admin.site.register(CourseTradeModel)
admin.site.register(Comment)
admin.site.register(ModuleCompletion)
admin.site.register(ChatRoom)
admin.site.register(ChatMessage)