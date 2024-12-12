# goals/serializers.py
from rest_framework import serializers
from .models import Goals, ConcretenessModule, ActivityReminder, UserProgress

class GoalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goals
        fields = '__all__'

class ConcretenessModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConcretenessModule
        fields = '__all__'

class ActivityReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityReminder
        fields = '__all__'

class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'
