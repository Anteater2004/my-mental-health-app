from django.db import models
from django.conf import settings
from django.utils import timezone

class Prompt(models.Model):
    """
    Stores the self-reflective statements or questions presented to users.
    """
    CATEGORY_CHOICES = [
        ('mood', 'Mood'),
        ('stress', 'Stress'),
        ('gratitude', 'Gratitude'),
        ('self_esteem', 'Self-Esteem'),
        # Add more categories as needed
    ]

    text = models.CharField(max_length=255)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.text} ({self.category})"

class SwipeSession(models.Model):
    """
    Represents a user's swipe session.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='swipe_sessions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"SwipeSession {self.id} for {self.user.username} at {self.created_at}"

class UserResponse(models.Model):
    """
    Tracks each user's interaction with prompts.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    prompt = models.ForeignKey(
        Prompt,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    response = models.BooleanField()  # True for right swipe, False for left swipe
    timestamp = models.DateTimeField(auto_now_add=True)
    session = models.ForeignKey(
        SwipeSession,
        on_delete=models.CASCADE,
        related_name='responses',
        null=True,
        blank=True
    )
    feedback = models.CharField(max_length=255, blank=True, null=True)  # Optional feedback field

    def __str__(self):
        swipe = 'Right' if self.response else 'Left'
        session_id = self.session.id if self.session else 'None'
        return f"{self.user.username} - {self.prompt.text} - {swipe} - Session {session_id}"

class Insight(models.Model):
    """
    Stores AI-generated insights or affirmations based on user responses.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='insights'
    )
    content = models.TextField()
    generated_at = models.DateTimeField(auto_now_add=True)
    confidence_score = models.FloatField(null=True, blank=True)  # Optional field for AI confidence
    reviewed = models.BooleanField(default=False)  # Indicates if the insight has been reviewed by admin

    def __str__(self):
        return f"Insight for {self.user.username} at {self.generated_at.strftime('%Y-%m-%d %H:%M:%S')}"
