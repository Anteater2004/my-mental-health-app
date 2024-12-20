# journaling/models.py
from django.db import models
from django.conf import settings  # For AUTH_USER_MODEL
from django.utils import timezone  # For setting timestamps


class Journaling(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='journals')
    entry_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Journaling Entry {self.id} by {self.user.username}"


class Meditation(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.PositiveIntegerField()  # in minutes
    audio_url = models.URLField(blank=True, null=True)  # Optional
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class CognitiveExercise(models.Model):
    title = models.CharField(max_length=255)
    prompt = models.TextField()
    example = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ProblemSolvingSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='problem_solutions')
    title = models.CharField(max_length=255)
    scheduled_time = models.DateTimeField()
    notes_before = models.TextField(blank=True, null=True)  # Separate before notes
    notes_after = models.TextField(blank=True, null=True)   # Separate after notes
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)  # Timestamp when completed
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when created

    class Meta:
        ordering = ['-scheduled_time']

    def __str__(self):
        return f"ProblemSolvingSession {self.id}: {self.title} by {self.user.username}"
