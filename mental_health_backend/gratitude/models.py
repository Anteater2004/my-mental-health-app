from django.db import models
from django.conf import settings  # For AUTH_USER_MODEL

# Gratitude Entries
class Gratitude(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    entry_text = models.TextField()  # Entry related to gratitude
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Default ordering


# Compassion Exercises (e.g., self-compassion journaling)
class CompassionExercise(models.Model):
    title = models.CharField(max_length=255)  # E.g., "Write a letter to yourself"
    prompt = models.TextField()  # Instruction for the exercise
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
