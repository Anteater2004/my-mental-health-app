from django.db import models
from django.conf import settings  # For AUTH_USER_MODEL

class Journaling(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    entry_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Default ordering


class Meditation(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.IntegerField()  # in minutes
    audio_url = models.URLField(blank=True, null=True)  # Now optional
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class CognitiveExercise(models.Model):
    title = models.CharField(max_length=255)
    prompt = models.TextField()
    example = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class ProblemSolvingSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    scheduled_time = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-scheduled_time']
