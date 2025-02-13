from django.db import models
from django.contrib.auth import get_user_model
import cloudinary
import cloudinary.uploader
import cloudinary.models

User = get_user_model()

# Create your models here.


# Tutor Profile
class TutorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="tutor_profile")
    resume_url = cloudinary.models.CloudinaryField(resource_type='raw', blank=True, null=True)
    rating = models.FloatField(default=0.0)
    is_verified = models.BooleanField(default=False)
    cur_job_role = models.CharField(max_length=200, default="Not Specified")

    def update_rating(self):
        reviews = self.reviews.all() 
        avg_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
        self.rating = avg_rating if avg_rating else 0
        self.save()

    def __str__(self):
        return self.user.email
    
class TutorEducation(models.Model):
    tutor_profile = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name="educations")
    university = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    year_of_passing = models.IntegerField()

    def __str__(self):
        return f"{self.degree} from {self.university}"
    
class TutorWorkExperience(models.Model):
    tutor_profile = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name="work_experiences")
    company = models.CharField(max_length=200)
    job_role = models.CharField(max_length=200)
    date_of_joining = models.DateField()
    date_of_leaving = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.job_role} at {self.company}"
    
class TutorReview(models.Model):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tutor_reviews")
    rating = models.PositiveIntegerField()
    review = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['tutor', 'user']  # Prevents duplicate reviews from the same user

    def __str__(self):
         return f"Review by {self.user.first_name} on {self.tutor}"
    


