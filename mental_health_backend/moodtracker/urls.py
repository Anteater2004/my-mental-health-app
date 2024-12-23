from django.urls import path
from .views import (
    PromptListView,
    SwipeSessionCreateView,
    SwipeSessionCompleteView,
    UserResponseCreateView,
    InsightListView,
    GenerateInsightView,
    UserProgressView
)

urlpatterns = [
    path('prompts/', PromptListView.as_view(), name='prompt-list'),
    path('swipe_sessions/', SwipeSessionCreateView.as_view(), name='swipe-session-create'),
    path('swipe_sessions/<int:session_id>/complete/', SwipeSessionCompleteView.as_view(), name='swipe-session-complete'),
    path('responses/', UserResponseCreateView.as_view(), name='user-response-create'),
    path('insights/', InsightListView.as_view(), name='insight-list'),
    path('insights/generate/', GenerateInsightView.as_view(), name='generate-insight'),
    path('progress/', UserProgressView.as_view(), name='user-progress'),
]
