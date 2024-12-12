from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Gratitude, CompassionExercise
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class GratitudeAppTestCase(APITestCase):

    def setUp(self):
        self.client = APIClient()
        # Create users
        self.user = User.objects.create_user(
            username="testuser",
            password="password123",
            email="testuser@example.com"
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            password="password123",
            email="otheruser@example.com"
        )
        # Authenticate client
        self.client.force_authenticate(user=self.user)

        # Create sample gratitude entries
        Gratitude.objects.create(user=self.user, entry_text="I'm grateful for my family.")
        Gratitude.objects.create(user=self.user, entry_text="I'm grateful for my health.")
        Gratitude.objects.create(user=self.other_user, entry_text="I'm grateful for my job.")

        # Create sample compassion exercises
        CompassionExercise.objects.create(
            title="Self-Compassion Letter",
            prompt="Write a letter to yourself expressing kindness and understanding."
        )
        CompassionExercise.objects.create(
            title="Three Things I Did Well",
            prompt="Reflect on three things you did well today."
        )

    # Gratitude Tests
    def test_gratitude_list(self):
        response = self.client.get("/gratitude/")
        print("Response data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Since pagination is disabled for Gratitude, response.data should be a list
        # We have two entries for self.user and one for other_user, so only 2 should return.
        self.assertEqual(len(response.data), 2)

    def test_gratitude_create(self):
        data = {"entry_text": "I'm grateful for my friends."}
        response = self.client.post("/gratitude/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["entry_text"], data["entry_text"])

    def test_gratitude_detail(self):
        gratitude = Gratitude.objects.filter(user=self.user).first()
        response = self.client.get(f"/gratitude/{gratitude.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["entry_text"], gratitude.entry_text)

    def test_gratitude_update(self):
        gratitude = Gratitude.objects.filter(user=self.user).first()
        data = {"entry_text": "Updated gratitude entry."}
        response = self.client.put(f"/gratitude/{gratitude.id}/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["entry_text"], data["entry_text"])

    def test_gratitude_delete(self):
        gratitude = Gratitude.objects.filter(user=self.user).first()
        response = self.client.delete(f"/gratitude/{gratitude.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Gratitude.objects.filter(id=gratitude.id).exists())

    def test_gratitude_unauthorized_access(self):
        gratitude = Gratitude.objects.filter(user=self.other_user).first()
        response = self.client.get(f"/gratitude/{gratitude.id}/")
        # The user should not see another user's gratitude entry
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Compassion Exercise Tests
    def test_compassion_exercise_list(self):
        response = self.client.get("/gratitude/compassion_exercises/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Pagination is enabled, check results key
        self.assertEqual(len(response.data["results"]), 2)

    def test_compassion_exercise_pagination(self):
        # Add additional exercises to trigger pagination
        for i in range(15):
            CompassionExercise.objects.create(
                title=f"Exercise {i}",
                prompt=f"This is a detailed prompt for exercise {i}."
            )
        response = self.client.get("/gratitude/compassion_exercises/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)  # First page should have 10 results
        self.assertIn("next", response.data)

    def test_compassion_exercise_detail(self):
        exercise = CompassionExercise.objects.first()
        response = self.client.get(f"/gratitude/compassion_exercises/{exercise.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], exercise.title)

    def test_compassion_exercise_create_invalid(self):
        # Title too short
        data = {"title": "Bad", "prompt": "Valid prompt"}
        response = self.client.post("/gratitude/compassion_exercises/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

        # Prompt too short
        data = {"title": "Valid Title", "prompt": "Bad"}
        response = self.client.post("/gratitude/compassion_exercises/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("prompt", response.data)
