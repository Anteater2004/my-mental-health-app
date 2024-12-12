from rest_framework import generics, permissions
from .models import Journaling, Meditation, CognitiveExercise, ProblemSolvingSession
from .serializers import (
    JournalingSerializer,
    MeditationSerializer,
    CognitiveExerciseSerializer,
    ProblemSolvingSessionSerializer,
)


class JournalingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalingSerializer

    def get_queryset(self):
        return Journaling.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JournalingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalingSerializer

    def get_queryset(self):
        return Journaling.objects.filter(user=self.request.user)


class MeditationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]  # Public access
    serializer_class = MeditationSerializer
    queryset = Meditation.objects.all()

    # Removed perform_create method since Meditation doesn't have a user field


class MeditationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.AllowAny]  # Public access
    serializer_class = MeditationSerializer
    queryset = Meditation.objects.all()


class CognitiveExerciseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]  # Public access
    serializer_class = CognitiveExerciseSerializer
    queryset = CognitiveExercise.objects.all()


class CognitiveExerciseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.AllowAny]  # Public access
    serializer_class = CognitiveExerciseSerializer
    queryset = CognitiveExercise.objects.all()


class ProblemSolvingSessionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProblemSolvingSessionSerializer

    def get_queryset(self):
        return ProblemSolvingSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProblemSolvingSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProblemSolvingSessionSerializer

    def get_queryset(self):
        return ProblemSolvingSession.objects.filter(user=self.request.user)
