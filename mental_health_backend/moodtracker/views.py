from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Prompt, UserResponse, Insight, SwipeSession
from .serializers import (
    PromptSerializer,
    UserResponseSerializer,
    InsightSerializer,
    SwipeSessionSerializer
)
import openai
from django.conf import settings
from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string

# Ensure OpenAI API key is set
openai.api_key = settings.OPENAI_API_KEY

class PromptListView(generics.ListAPIView):
    """
    API endpoint to retrieve a personalized list of prompts for the user to swipe.
    """
    serializer_class = PromptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Exclude prompts swiped in the last 7 days
        exclusion_period = timezone.now() - timezone.timedelta(days=7)
        excluded_prompts = UserResponse.objects.filter(
            user=user,
            timestamp__gte=exclusion_period
        ).values_list('prompt_id', flat=True)
        available_prompts = Prompt.objects.exclude(id__in=excluded_prompts)
        # If not enough prompts, fallback to all prompts
        if available_prompts.count() < 10:
            available_prompts = Prompt.objects.all()
        # Randomly select a subset
        selected_prompts = available_prompts.order_by('?')[:10]  # Adjust number as needed
        return selected_prompts

class SwipeSessionCreateView(generics.CreateAPIView):
    """
    Creates a new swipe session for the user.
    """
    serializer_class = SwipeSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserResponseCreateView(generics.CreateAPIView):
    """
    API endpoint to record a user's response to a prompt.
    """
    serializer_class = UserResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Associate response with the current active session if exists
        active_session = SwipeSession.objects.filter(user=self.request.user, completed=False).first()
        serializer.save(user=self.request.user, session=active_session)

class InsightListView(generics.ListAPIView):
    """
    API endpoint to retrieve insights for the user.
    """
    serializer_class = InsightSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Insight.objects.filter(user=self.request.user).order_by('-generated_at')

class GenerateInsightView(APIView):
    """
    API endpoint to generate an insight based on recent user responses.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        user = request.user
        session_id = request.data.get('session_id')
        
        # Validate session if session_id is provided
        if session_id:
            try:
                session = SwipeSession.objects.get(id=session_id, user=user, completed=False)
            except SwipeSession.DoesNotExist:
                return Response({'error': 'Invalid or completed session.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            session = None

        # Fetch recent responses, e.g., last 10
        recent_responses = UserResponse.objects.filter(user=user).order_by('-timestamp')[:10]
        if not recent_responses.exists():
            return Response({"detail": "Not enough data to generate insight."}, status=status.HTTP_400_BAD_REQUEST)

        # Prepare data for AI
        prompt_text = "Analyze the following user responses and provide a thoughtful, positive, and actionable mental health insight or affirmation.\n\n"
        for response in recent_responses:
            swipe = "Resonates" if response.response else "Does not resonate"
            prompt_text += f"- {response.prompt.text}: {swipe}\n"

        # Optionally, include user preferences or additional context
        # For example, categories the user prefers
        # Since we're not modifying the 'users' app, preferences can be handled here if implemented
        # Example: prompt_text += f"\nUser Preferences: {', '.join(user_preferences)}."

        # Enqueue the insight generation task
        generate_insight_task.delay(user.id, prompt_text, session_id)

        return Response({'message': 'Insight generation in progress.'}, status=status.HTTP_202_ACCEPTED)

class SwipeSessionCompleteView(APIView):
    """
    Marks a swipe session as completed.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id, format=None):
        try:
            session = SwipeSession.objects.get(id=session_id, user=request.user, completed=False)
            session.completed = True
            session.save()
            return Response({'message': 'Swipe session marked as completed.'}, status=status.HTTP_200_OK)
        except SwipeSession.DoesNotExist:
            return Response({'error': 'Swipe session not found or already completed.'}, status=status.HTTP_404_NOT_FOUND)

class UserProgressView(APIView):
    """
    API endpoint to retrieve user progress metrics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        categories = Prompt.CATEGORY_CHOICES
        swipes_by_category = {category: user.responses.filter(prompt__category=category).count() for category, _ in categories}
        total_swipes = user.responses.count()
        # Calculate current streak (number of consecutive days with at least one swipe)
        today = timezone.now().date()
        streak = 0
        while True:
            day = today - timezone.timedelta(days=streak)
            if user.responses.filter(timestamp__date=day).exists():
                streak += 1
            else:
                break
        data = {
            'total_swipes': total_swipes,
            'swipes_by_category': swipes_by_category,
            'current_streak': streak,
        }
        return Response(data, status=status.HTTP_200_OK)
