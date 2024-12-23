# moodtracker/tasks.py

from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Insight, SwipeSession
import requests
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string

@shared_task
def generate_insight_task(user_id, prompt_text, session_id=None):
    """
    Generates an AI-driven insight based on user responses and emails it to the user.
    """
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    # Hugging Face Inference API URL for the selected model
    model_name = "gpt2"  # Replace with your chosen model
    API_URL = f"https://api-inference.huggingface.co/models/{model_name}"
    headers = {
        "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"
    }

    # Prepare the payload for the API
    payload = {
        "inputs": prompt_text,
        "parameters": {
            "max_length": 150,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True,
            "num_return_sequences": 1
        }
    }

    # Call the Hugging Face Inference API
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()  # Raises stored HTTPError, if one occurred.
        data = response.json()
        # Extract the generated text
        insight_content = data[0]['generated_text'].strip()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        insight_content = "We're experiencing issues generating your insight. Please try again later."
    except Exception as err:
        print(f"An error occurred: {err}")
        insight_content = "An error occurred while generating your insight. Please try again later."

    # Save the insight
    insight = Insight.objects.create(
        user=user,
        content=insight_content,
        generated_at=timezone.now(),
        confidence_score=None,  # Hugging Face Inference API may not provide confidence scores directly
    )

    # Optionally, associate the insight with the swipe session
    if session_id:
        try:
            session = SwipeSession.objects.get(id=session_id, user=user, completed=False)
            # If linking is desired, add a ForeignKey or ManyToManyField
            # For simplicity, this example does not establish the link
        except SwipeSession.DoesNotExist:
            pass

    # Send the insight via email
    subject = 'Your Personalized Mental Health Insight'
    message = render_to_string('emails/insight_email.html', {'user': user, 'insight': insight})
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

@shared_task
def send_swipe_reminders():
    """
    Sends daily swipe reminders to users who haven't completed their swipe sessions.
    """
    User = get_user_model()
    users = User.objects.filter(is_active=True)
    for user in users:
        # Check if the user hasn't completed a swipe session today
        today = timezone.now().date()
        if not user.swipe_sessions.filter(created_at__date=today).exists():
            subject = 'Time for Your Daily Self-Reflection!'
            message = render_to_string('emails/swipe_reminder.html', {'user': user})
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
