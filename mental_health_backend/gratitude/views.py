from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from .models import Gratitude, CompassionExercise
from .serializers import GratitudeSerializer, CompassionExerciseSerializer

class CompassionExercisePagination(PageNumberPagination):
    page_size = 10

# Gratitude Views
class GratitudeListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GratitudeSerializer
    pagination_class = None  # Disable pagination for Gratitude entries

    def get_queryset(self):
        return Gratitude.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GratitudeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GratitudeSerializer

    def get_queryset(self):
        return Gratitude.objects.filter(user=self.request.user)

# Compassion Exercises Views
class CompassionExerciseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]  # Public access
    serializer_class = CompassionExerciseSerializer
    queryset = CompassionExercise.objects.all()
    pagination_class = CompassionExercisePagination

class CompassionExerciseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CompassionExerciseSerializer
    queryset = CompassionExercise.objects.all()
