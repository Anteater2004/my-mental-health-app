from django.urls import path
from .views import (
    GratitudeListCreateView, GratitudeDetailView,
    CompassionExerciseListCreateView, CompassionExerciseDetailView
)

urlpatterns = [
    path('', GratitudeListCreateView.as_view(), name='gratitude-list'),
    path('<int:pk>/', GratitudeDetailView.as_view(), name='gratitude-detail'),
    path('compassion_exercises/', CompassionExerciseListCreateView.as_view(), name='compassion-exercises'),
    path('compassion_exercises/<int:pk>/', CompassionExerciseDetailView.as_view(), name='compassion-exercise-detail'),
]
