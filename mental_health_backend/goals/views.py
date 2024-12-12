from rest_framework import generics
from .models import Goals, ConcretenessModule, ActivityReminder, UserProgress
from .serializers import GoalsSerializer, ConcretenessModuleSerializer, ActivityReminderSerializer, UserProgressSerializer

# Goals Views
class GoalsListCreateView(generics.ListCreateAPIView):
    queryset = Goals.objects.all()
    serializer_class = GoalsSerializer

class GoalsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Goals.objects.all()
    serializer_class = GoalsSerializer

# Concreteness Module Views
class ConcretenessModuleListCreateView(generics.ListCreateAPIView):
    queryset = ConcretenessModule.objects.all()
    serializer_class = ConcretenessModuleSerializer

class ConcretenessModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ConcretenessModule.objects.all()
    serializer_class = ConcretenessModuleSerializer

# Activity Reminder Views
class ActivityReminderListCreateView(generics.ListCreateAPIView):
    queryset = ActivityReminder.objects.all()
    serializer_class = ActivityReminderSerializer

class ActivityReminderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ActivityReminder.objects.all()
    serializer_class = ActivityReminderSerializer

# User Progress Views
class UserProgressListCreateView(generics.ListCreateAPIView):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer

class UserProgressDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
