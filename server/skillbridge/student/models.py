from django.db import models
from users.models import User

# Create your models here.


# Student Profile
    
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    
    def __str__(self):
        return self.user.email
    
    # def delete(self, *args, **kwargs):
    #     # Delete the related User when the StudentProfile is deleted
    #     self.user.delete()
    #     super().delete(*args, **kwargs)