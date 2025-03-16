from django.db import models
from django.utils.text import slugify
from base.base_models import BaseModel
from tutor.models import TutorProfile
import cloudinary
import cloudinary.uploader
import cloudinary.models
from django.contrib.auth import get_user_model
from django.db.models import Avg

User = get_user_model()




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
    stripe_price_id = models.CharField(max_length=100, null=True, blank=True)

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
    
    def update_rating(self):
        self.rating = self.reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0
        self.save()

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']

    
class Module(BaseModel):

    course =  models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=150, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    video = cloudinary.models.CloudinaryField(resource_type='video', null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True, default=0)
    tasks = cloudinary.models.CloudinaryField(resource_type="raw", blank=True, null=True)
    is_liked = models.BooleanField(default=False)
    likes_count = models.PositiveBigIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title
    class Meta:
        ordering = ['id']

class ModuleCompletion(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="completions")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'module')

    def __str__(self):
        return f"{self.user.first_name} completed {self.module.title}"

class Purchase(BaseModel):
    PURCHASE_TYPE_CHOICES = (
        ('Payment', 'payment'),
        ('Trade', 'trade')
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="purchases")
    stripe_payment_intent_id = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    purchase_type = models.CharField(max_length=20, choices=PURCHASE_TYPE_CHOICES, default="Payment")
    progress = models.FloatField(default=0.0, null=True, blank=True)  # Store progression percentage (0-100)
    completed = models.BooleanField(default=False)  # Mark if the course is completed
    purchased_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)  # Track purchase date

    class Meta:
         unique_together = ('user', 'course')

    def update_progress(self):
        total_modules = self.course.modules.count()
        completed_modules = ModuleCompletion.objects.filter(user=self.user, module__course=self.course).count()

        if total_modules > 0:
            self.progress = (completed_modules/total_modules) * 100
            self.completed = self.progress == 100
            self.save()

    def __str__(self):

        return f"{self.user.first_name} purchased {self.course.title}"
    
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveIntegerField(default=1, choices=[(i,i) for i in range(1,6)])
    review = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
         return f"Review by {self.user.first_name} on {self.course.title}"
    

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="comments")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name="replies", null=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.first_name} on {self.course.title}"
    

class CourseTradeModel(models.Model):

    STATUS_CHOICES = (
        ('Accepted', 'approved'),
        ('Declined', 'declined'),
        ('Pending', 'pending'),
    )
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_trade_requests")
    requested_course = models.ForeignKey(Course,on_delete=models.CASCADE, related_name="trade_requests" )
    offered_course = models.ForeignKey(Course,on_delete=models.CASCADE, related_name="offered_trades")
    accepter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_trade_requests")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

class ChatRoom(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="student_chats")
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tutor_chats")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="course_chats")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'tutor', 'course')

    def __str__(self):
        return f"Room for {self.course.title} between {self.student.first_name} and {self.tutor.first_name}"
    
class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    