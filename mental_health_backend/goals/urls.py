from django.urls import path
from .views import (
    GoalsListCreateView, GoalsDetailView,
    ConcretenessModuleListCreateView, ConcretenessModuleDetailView,
    ActivityReminderListCreateView, ActivityReminderDetailView,
    UserProgressListCreateView, UserProgressDetailView
)

urlpatterns = [
    path('', GoalsListCreateView.as_view(), name='goals-list'),
    path('<int:pk>/', GoalsDetailView.as_view(), name='goals-detail'),
    path('concreteness_modules/', ConcretenessModuleListCreateView.as_view(), name='concreteness-modules'),
    path('concreteness_modules/<int:pk>/', ConcretenessModuleDetailView.as_view(), name='concreteness-module-detail'),
    path('activity_reminders/', ActivityReminderListCreateView.as_view(), name='activity-reminders'),
    path('activity_reminders/<int:pk>/', ActivityReminderDetailView.as_view(), name='activity-reminder-detail'),
    path('user_progress/', UserProgressListCreateView.as_view(), name='user-progress'),
    path('user_progress/<int:pk>/', UserProgressDetailView.as_view(), name='user-progress-detail'),
]
