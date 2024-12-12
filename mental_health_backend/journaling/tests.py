from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Journaling, Meditation, CognitiveExercise, ProblemSolvingSession
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class JournalingAppTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="testuser", password="password123")

    def setUp(self):
        self.client.force_authenticate(user=self.user)
        Journaling.objects.bulk_create(
            [
                Journaling(user=self.user, entry_text="Entry 1"),
                Journaling(user=self.user, entry_text="Entry 2"),
                Journaling(user=self.user, entry_text="Entry 3"),
                Journaling(user=self.user, entry_text="Entry 4"),
                Journaling(user=self.user, entry_text="Entry 5"),
                Journaling(user=self.user, entry_text="Entry 6"),
                Journaling(user=self.user, entry_text="Entry 7"),
                Journaling(user=self.user, entry_text="Entry 8"),
                Journaling(user=self.user, entry_text="Entry 9"),
                Journaling(user=self.user, entry_text="Entry 10"),
                Journaling(user=self.user, entry_text="Entry 11"),
                Journaling(user=self.user, entry_text="Entry 12"),
            ]
        )

    # Journaling Tests
    def test_journaling_create(self):
        data = {"entry_text": "New Entry"}
        response = self.client.post("/journaling/journaling/", data)
        logger.debug(f"test_journaling_create | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_journaling_create_invalid(self):
        data = {"entry_text": ""}
        response = self.client.post("/journaling/journaling/", data)
        logger.debug(f"test_journaling_create_invalid | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_journaling_detail(self):
        journaling_entry = Journaling.objects.first()
        response = self.client.get(f"/journaling/journaling/{journaling_entry.id}/")
        logger.debug(f"test_journaling_detail | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_journaling_detail_nonexistent(self):
        response = self.client.get("/journaling/journaling/999999/")
        logger.debug(f"test_journaling_detail_nonexistent | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_journaling_list(self):
        response = self.client.get("/journaling/journaling/")
        logger.debug(f"test_journaling_list | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_journaling_pagination(self):
        # Assuming pagination is enabled for the Journaling view
        response = self.client.get("/journaling/journaling/?page=1")
        logger.debug(f"test_journaling_pagination | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_journaling_update(self):
        journaling_entry = Journaling.objects.first()
        data = {"entry_text": "Updated Entry"}
        response = self.client.put(
            f"/journaling/journaling/{journaling_entry.id}/", data, format='json'
        )
        logger.debug(f"test_journaling_update | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["entry_text"], "Updated Entry")

    def test_journaling_update_invalid(self):
        journaling_entry = Journaling.objects.first()
        data = {"entry_text": ""}
        response = self.client.put(
            f"/journaling/journaling/{journaling_entry.id}/", data, format='json'
        )
        logger.debug(f"test_journaling_update_invalid | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_journaling_update_nonexistent(self):
        data = {"entry_text": "Updated Entry"}
        response = self.client.put("/journaling/journaling/999999/", data, format='json')
        logger.debug(f"test_journaling_update_nonexistent | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_journaling_delete(self):
        journaling_entry = Journaling.objects.last()
        response = self.client.delete(f"/journaling/journaling/{journaling_entry.id}/")
        logger.debug(f"test_journaling_delete | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_journaling_delete_nonexistent(self):
        response = self.client.delete("/journaling/journaling/999999/")
        logger.debug(f"test_journaling_delete_nonexistent | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthorized_access(self):
        self.client.logout()
        response = self.client.get("/journaling/journaling/")
        logger.debug(f"test_unauthorized_access | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Meditation Tests
    def test_meditation_create(self):
        data = {
            "title": "Meditation 1",
            "description": "Relaxation exercise",
            "duration": 15,
            "audio_url": "http://example.com/audio"
        }
        response = self.client.post("/journaling/meditations/", data, format='json')
        logger.debug(f"test_meditation_create | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_meditation_detail(self):
        # Create a meditation instance
        meditation = Meditation.objects.create(
            title="Meditation 1",
            description="Relaxation exercise",
            duration=15,
            audio_url="http://example.com/audio"
        )
        response = self.client.get(f"/journaling/meditations/{meditation.id}/")
        logger.debug(f"test_meditation_detail | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_meditation_detail_nonexistent(self):
        response = self.client.get("/journaling/meditations/999999/")
        logger.debug(f"test_meditation_detail_nonexistent | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_meditation_duration(self):
        data = {
            "title": "Meditation 1",
            "description": "Relaxation exercise",
            "duration": -5,
            "audio_url": "http://example.com/audio"
        }
        response = self.client.post("/journaling/meditations/", data, format='json')
        logger.debug(f"test_invalid_meditation_duration | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_meditation_create(self):
        self.client.logout()
        data = {
            "title": "Meditation without auth",
            "description": "This should succeed",
            "duration": 10,
            "audio_url": "http://example.com/audio"
        }
        response = self.client.post("/journaling/meditations/", data, format='json')
        logger.debug(f"test_unauthorized_meditation_create | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # Cognitive Exercise Tests
    def test_cognitive_exercise_detail_nonexistent(self):
        response = self.client.get("/journaling/cognitive_exercises/999999/")
        logger.debug(f"test_cognitive_exercise_detail_nonexistent | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cognitive_exercise_detail(self):
        # Create a cognitive exercise instance
        exercise = CognitiveExercise.objects.create(
            title="Cognitive Exercise",
            prompt="Reflect on a challenging thought."
        )
        response = self.client.get(f"/journaling/cognitive_exercises/{exercise.id}/")
        logger.debug(f"test_cognitive_exercise_detail | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Cognitive Exercise")

    # Problem Solving Session Tests
    def test_problem_solving_session_create(self):
        data = {
            "title": "Solve Problem",
            "scheduled_time": "2024-12-01T10:00:00Z",
            "notes": "This is a test note",
            "completed": False
        }
        response = self.client.post("/journaling/problem_solving_sessions/", data, format='json')
        logger.debug(f"test_problem_solving_session_create | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_problem_solving_session_create_invalid(self):
        data = {"title": "", "scheduled_time": ""}
        response = self.client.post("/journaling/problem_solving_sessions/", data, format='json')
        logger.debug(f"test_problem_solving_session_create_invalid | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_problem_solving_session_list(self):
        response = self.client.get("/journaling/problem_solving_sessions/")
        logger.debug(f"test_problem_solving_session_list | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_problem_solving_session_detail(self):
        # Create a problem solving session
        data = {
            "title": "Check Problem",
            "scheduled_time": "2025-01-01T10:00:00Z",
            "notes": "Session details",
            "completed": False
        }
        create_response = self.client.post("/journaling/problem_solving_sessions/", data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        session_id = create_response.data["id"]

        # Now retrieve it
        response = self.client.get(f"/journaling/problem_solving_sessions/{session_id}/")
        logger.debug(f"test_problem_solving_session_detail | Status: {response.status_code} | Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Check Problem")

    def test_problem_solving_session_update(self):
        # Create first
        data = {
            "title": "Update Problem",
            "scheduled_time": "2025-01-01T10:00:00Z",
            "notes": "Initial notes",
            "completed": False
        }
        create_response = self.client.post("/journaling/problem_solving_sessions/", data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        session_id = create_response.data["id"]

        # Include all required fields for PUT (title, scheduled_time, notes, completed)
        update_data = {
            "title": "Updated Title",
            "scheduled_time": "2025-01-01T10:00:00Z",
            "notes": "Initial notes",
            "completed": True
        }
        update_response = self.client.put(f"/journaling/problem_solving_sessions/{session_id}/", update_data, format='json')
        logger.debug(f"test_problem_solving_session_update | Status: {update_response.status_code} | Data: {update_response.data}")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertTrue(update_response.data["completed"])
        self.assertEqual(update_response.data["title"], "Updated Title")

    def test_problem_solving_session_delete(self):
        # Create first
        data = {
            "title": "Delete Problem",
            "scheduled_time": "2025-01-01T10:00:00Z",
            "notes": "Will delete this",
            "completed": False
        }
        create_response = self.client.post("/journaling/problem_solving_sessions/", data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        session_id = create_response.data["id"]

        # Delete it
        delete_response = self.client.delete(f"/journaling/problem_solving_sessions/{session_id}/")
        logger.debug(f"test_problem_solving_session_delete | Status: {delete_response.status_code} | Data: {delete_response.data}")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
