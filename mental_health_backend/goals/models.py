from django.db import models
from django.conf import settings

class Goals(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    goal_name = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('in-progress', 'In Progress'), ('completed', 'Completed')])

class ConcretenessModule(models.Model):
    title = models.CharField(max_length=255)
    steps = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class ActivityReminder(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    reminder_time = models.TimeField()

class UserProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    completed_sessions = models.IntegerField()
    notes = models.TextField(blank=True, null=True)
