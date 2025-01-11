from django.db import models
from student.models import StudentProfile
from tutor.models import TutorProfile

# Create your models here.


# Social Media Platform
class SocialMediaPlatform(models.Model):
    tutor_profile = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, blank=True, null=True)
    student_profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, blank=True, null=True)
    platform = models.CharField(max_length=50)
    profile_url = models.URLField()

    def __str__(self):
        return f"{self.platform} - {self.profile_url}"