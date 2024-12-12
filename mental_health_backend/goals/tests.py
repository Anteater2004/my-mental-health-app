from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from datetime import date, time
from .models import Goals, ConcretenessModule, ActivityReminder, UserProgress

User = get_user_model()

class GoalsAppTestCase(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="testuser", password="password123")

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    # ---------------------
    # Goals Tests
    # ---------------------
    def test_goals_list_empty(self):
        url = reverse('goals-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check the results key of the paginated response
        self.assertEqual(response.data["results"], [])

    def test_goals_create(self):
        url = reverse('goals-list')
        data = {
            "user": self.user.id,
            "goal_name": "Exercise More",
            "description": "Go to the gym 3 times a week",
            "due_date": "2025-01-01",
            "status": "in-progress"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["goal_name"], "Exercise More")

    def test_goals_create_invalid(self):
        url = reverse('goals-list')
        data = {"user": self.user.id}  # Missing required fields
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_goals_retrieve_update_delete(self):
        goal = Goals.objects.create(
            user=self.user,
            goal_name="Learn Guitar",
            description="Practice 30 mins daily",
            due_date="2025-05-05",
            status="in-progress"
        )

        detail_url = reverse('goals-detail', kwargs={'pk': goal.id})
        
        # Retrieve
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["goal_name"], "Learn Guitar")

        # Update
        update_data = {
            "user": self.user.id,
            "goal_name": "Learn Piano",
            "description": "Practice 15 mins daily",
            "due_date": "2025-10-10",
            "status": "completed"
        }
        response = self.client.put(detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["goal_name"], "Learn Piano")
        self.assertEqual(response.data["status"], "completed")

        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Goals.objects.filter(id=goal.id).exists())

    # ---------------------
    # ConcretenessModule Tests
    # ---------------------
    def test_concreteness_module_list_empty(self):
        url = reverse('concreteness-modules')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check results key
        self.assertEqual(response.data["results"], [])

    def test_concreteness_module_create(self):
        url = reverse('concreteness-modules')
        data = {
            "title": "Module 1",
            "steps": "Step 1: Do something concrete"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Module 1")

    def test_concreteness_module_create_invalid(self):
        url = reverse('concreteness-modules')
        data = {"title": ""}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_concreteness_module_retrieve_update_delete(self):
        module = ConcretenessModule.objects.create(
            title="Original Module",
            steps="Original steps"
        )
        detail_url = reverse('concreteness-module-detail', kwargs={'pk': module.id})

        # Retrieve
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Original Module")

        # Update
        update_data = {
            "title": "Updated Module",
            "steps": "Updated steps"
        }
        response = self.client.put(detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Module")

        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ConcretenessModule.objects.filter(id=module.id).exists())

    # ---------------------
    # ActivityReminder Tests
    # ---------------------
    def test_activity_reminder_list_empty(self):
        url = reverse('activity-reminders')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check results key
        self.assertEqual(response.data["results"], [])

    def test_activity_reminder_create(self):
        url = reverse('activity-reminders')
        data = {
            "user": self.user.id,
            "title": "Morning Yoga",
            "description": "15 minutes of yoga at sunrise",
            "reminder_time": "06:30:00"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Morning Yoga")

    def test_activity_reminder_create_invalid(self):
        url = reverse('activity-reminders')
        data = {"user": self.user.id, "title": ""}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_activity_reminder_retrieve_update_delete(self):
        reminder = ActivityReminder.objects.create(
            user=self.user,
            title="Evening Walk",
            description="Walk around the block",
            reminder_time=time(18, 0)
        )
        detail_url = reverse('activity-reminder-detail', kwargs={'pk': reminder.id})

        # Retrieve
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Evening Walk")

        # Update
        update_data = {
            "user": self.user.id,
            "title": "Late Evening Walk",
            "description": "Walk around the park",
            "reminder_time": "20:00:00"
        }
        response = self.client.put(detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Late Evening Walk")

        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ActivityReminder.objects.filter(id=reminder.id).exists())

    # ---------------------
    # UserProgress Tests
    # ---------------------
    def test_user_progress_list_empty(self):
        url = reverse('user-progress')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check results key
        self.assertEqual(response.data["results"], [])

    def test_user_progress_create(self):
        url = reverse('user-progress')
        data = {
            "user": self.user.id,
            "date": "2025-02-02",
            "completed_sessions": 3,
            "notes": "Feeling better each day"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["completed_sessions"], 3)

    def test_user_progress_create_invalid(self):
        url = reverse('user-progress')
        data = {"user": self.user.id}  # missing required fields
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_progress_retrieve_update_delete(self):
        progress = UserProgress.objects.create(
            user=self.user,
            date=date.today(),
            completed_sessions=1,
            notes="Initial note"
        )
        detail_url = reverse('user-progress-detail', kwargs={'pk': progress.id})

        # Retrieve
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["completed_sessions"], 1)

        # Update
        update_data = {
            "user": self.user.id,
            "date": str(date.today()),
            "completed_sessions": 5,
            "notes": "Updated note"
        }
        response = self.client.put(detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["completed_sessions"], 5)

        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UserProgress.objects.filter(id=progress.id).exists())
