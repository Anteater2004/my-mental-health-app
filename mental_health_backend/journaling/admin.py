# journaling/admin.py

from django.contrib import admin
from .models import Journaling, Meditation, CognitiveExercise, ProblemSolvingSession

@admin.register(Journaling)
class JournalingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at')
    search_fields = ('user__username', 'entry_text')
    list_filter = ('created_at',)

@admin.register(Meditation)
class MeditationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'duration', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('created_at',)

@admin.register(CognitiveExercise)
class CognitiveExerciseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_at')
    search_fields = ('title', 'prompt', 'example')
    list_filter = ('created_at',)

@admin.register(ProblemSolvingSession)
class ProblemSolvingSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'scheduled_time', 'completed', 'created_at')
    search_fields = ('user__username', 'title', 'notes_before', 'notes_after')
    list_filter = ('completed', 'created_at', 'scheduled_time')
