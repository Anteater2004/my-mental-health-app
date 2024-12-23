from rest_framework import serializers
from .models import Prompt, UserResponse, Insight, SwipeSession

class PromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prompt
        fields = ['id', 'text', 'category']

class SwipeSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SwipeSession
        fields = ['id', 'created_at', 'completed']
        read_only_fields = ['id', 'created_at', 'completed']

class UserResponseSerializer(serializers.ModelSerializer):
    feedback = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = UserResponse
        fields = ['id', 'user', 'prompt', 'response', 'timestamp', 'session', 'feedback']
        read_only_fields = ['user', 'timestamp']

class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = ['id', 'user', 'content', 'generated_at', 'confidence_score', 'reviewed']
        read_only_fields = ['user', 'content', 'generated_at', 'confidence_score', 'reviewed']
