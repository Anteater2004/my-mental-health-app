from django.urls import path
from .views import (
    JournalingListCreateView,
    JournalingDetailView,
    MeditationListCreateView,
    MeditationDetailView,
    CognitiveExerciseListCreateView,
    CognitiveExerciseDetailView,
    ProblemSolvingSessionListCreateView,
    ProblemSolvingSessionDetailView,
)

urlpatterns = [
    path('', JournalingListCreateView.as_view(), name='journaling-list-create'),
    path('<int:pk>/', JournalingDetailView.as_view(), name='journaling-detail'),

    path('meditations/', MeditationListCreateView.as_view(), name='meditations'),
    path('meditations/<int:pk>/', MeditationDetailView.as_view(), name='meditation-detail'),

    path('cognitive_exercises/', CognitiveExerciseListCreateView.as_view(), name='cognitive-exercises'),
    path('cognitive_exercises/<int:pk>/', CognitiveExerciseDetailView.as_view(), name='cognitive-exercise-detail'),

    path('problem_solving_sessions/', ProblemSolvingSessionListCreateView.as_view(), name='problem-solving-sessions'),
    path('problem_solving_sessions/<int:pk>/', ProblemSolvingSessionDetailView.as_view(), name='problem-solving-session-detail'),
]
