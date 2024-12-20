# journaling/serializers.py

from rest_framework import serializers
from .models import Journaling, Meditation, CognitiveExercise, ProblemSolvingSession
from django.utils import timezone


class JournalingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journaling
        fields = ['id', 'entry_text', 'created_at', 'user']
        read_only_fields = ['user', 'created_at']

    def validate_entry_text(self, value):
        if not value.strip():
            raise serializers.ValidationError("Entry text cannot be empty.")
        return value


class MeditationSerializer(serializers.ModelSerializer):
    audio_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Meditation
        fields = ['id', 'title', 'description', 'duration', 'audio_url', 'created_at']
        read_only_fields = ['created_at']

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be a positive integer.")
        return value

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value


class CognitiveExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CognitiveExercise
        fields = ['id', 'title', 'prompt', 'example', 'created_at']
        read_only_fields = ['created_at']

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value


class ProblemSolvingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemSolvingSession
        fields = [
            'id',
            'user',
            'title',
            'scheduled_time',
            'notes_before',
            'notes_after',
            'completed',
            'completed_at',
            'created_at'
        ]
        read_only_fields = ['user', 'completed_at', 'created_at']

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_scheduled_time(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Scheduled time must be in the future.")
        return value

    def update(self, instance, validated_data):
        completed = validated_data.get('completed', instance.completed)
        if completed and not instance.completed:
            instance.completed_at = timezone.now()
        elif not completed and instance.completed:
            instance.completed_at = None
        return super().update(instance, validated_data)
