from django.db import models
from django.utils.text import slugify
from base.base_models import BaseModel
from tutor.models import TutorProfile
import cloudinary
import cloudinary.uploader
import cloudinary.models



class Category(models.Model):

    name = models.CharField(unique=True, max_length=100, blank=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):

        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            num = 1
            while Category.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{num}'
                num += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):    
        return self.name

class Course(BaseModel):

    STATUS_CHOICES = (
        ('Approved', 'approved'),
        ('Declined', 'declined'),
        ('Pending', 'pending'),
    )
    LEVEL_CHOICES = (
        ('Beginner', 'beginner'),
        ('Intermediate', 'intermediate'),
        ('Advanced', 'advanced'),
    )

    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='instructed_courses')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='courses', null=True, blank=True)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    title = models.CharField(max_length=150, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    thumbnail = cloudinary.models.CloudinaryField('image', blank=True, null=True)
    total_enrollment = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    skill_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Beginner')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            num = 1
            while Course.objects.filter(slug=slug).exists(): 
                slug = f'{base_slug}-{num}'
                num += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']

    
class Module(BaseModel):

    course =  models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=150, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    video = cloudinary.models.CloudinaryField('video', null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True, default=0)
    tasks = cloudinary.models.CloudinaryField('file', blank=True, null=True)
    is_liked = models.BooleanField(default=False)
    likes_count = models.PositiveBigIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title
    class Meta:
        ordering = ['id']