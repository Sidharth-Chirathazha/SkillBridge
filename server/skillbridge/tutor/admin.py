from django.contrib import admin
from .models import TutorEducation,TutorProfile,TutorWorkExperience,TutorReview
# Register your models here.

admin.site.register(TutorProfile)
admin.site.register(TutorEducation)
admin.site.register(TutorWorkExperience)
admin.site.register(TutorReview)