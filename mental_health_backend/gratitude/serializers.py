from rest_framework import serializers
from .models import Gratitude, CompassionExercise

class GratitudeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gratitude
        fields = ['id', 'user', 'entry_text', 'created_at']
        read_only_fields = ['user']

class CompassionExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompassionExercise
        fields = '__all__'

    # Add validation for title
    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long.")
        return value

    # Add validation for prompt
    def validate_prompt(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Prompt must be at least 10 characters long.")
        return value
