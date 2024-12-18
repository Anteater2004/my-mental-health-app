from rest_framework import serializers
from .models import Journaling, Meditation, CognitiveExercise, ProblemSolvingSession


class JournalingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journaling
        fields = ['id', 'entry_text', 'created_at', 'user']
        read_only_fields = ['user']


class MeditationSerializer(serializers.ModelSerializer):
    audio_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Meditation
        fields = '__all__'

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be positive.")
        return value



class CognitiveExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CognitiveExercise
        fields = '__all__'


class ProblemSolvingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemSolvingSession
        fields = '__all__'
        read_only_fields = ['user']
