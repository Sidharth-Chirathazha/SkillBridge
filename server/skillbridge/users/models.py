from django.contrib.auth.models import AbstractBaseUser,BaseUserManager,PermissionsMixin
from django.core.validators import MinValueValidator
from django.db import models
import cloudinary
import cloudinary.uploader
import cloudinary.models


# Create your models here.

# User Model
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, role=None, **extra_fields):
        if not email:
            raise ValueError("The Email field is required")
        if not role:
            raise ValueError("The Role field is required for non - super users")
        email = self.normalize_email(email)
        user = self.model(email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password,role='admin', **extra_fields)
    
class Skill(models.Model):
    skill_name = models.CharField(max_length=100,unique=True)

    def __str__(self):
        return self.skill_name

class User(AbstractBaseUser):
    
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('tutor', 'Tutor'),
        ('admin', 'Admin'),
    )

    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    profile_pic_url = cloudinary.models.CloudinaryField('image', blank=True, null=True)
    linkedin_url = models.CharField(unique=True, null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    country = models.CharField(max_length=100,null=True, blank=True)
    city = models.CharField(max_length=100,null=True, blank=True)
    skills = models.ManyToManyField(Skill, related_name="users_skills", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    password = models.CharField(max_length=128)
    total_time_spent = models.PositiveIntegerField(default=0)


    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    
    # Add the following methods:
    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        return self.is_superuser

    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app 'app_label'?"""
        return self.is_superuser
    
class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activities")
    date = models.DateField(auto_now_add=True)  # Stores when the activity happened
    time_spent = models.IntegerField(default=0)  # Time spent in seconds

    class Meta:
        unique_together = ("user", "date")  # Ensures one entry per user per day
    
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("message", "Message"),
        ("trade_request", "Trade Request"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        
        return f"{self.user} - {self.notification_type} - {self.message}"
    


class Blog(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blogs")
    title = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail = cloudinary.models.CloudinaryField('image', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name="liked_blogs", blank=True)

    def total_likes(self):
        return self.likes.count()

    def __str__(self):
        return self.title
    
class Comment(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name="replies")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.parent:
            return f"Reply by {self.user.get_full_name()} on {self.blog.title}"
        return f"Comment by {self.user.get_full_name()} on {self.blog.title}"