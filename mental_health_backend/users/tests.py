from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class UsersAppTestCase(APITestCase):

    def setUp(self):
        # Create a few sample users
        self.user1 = User.objects.create_user(username="user1", email="user1@example.com", password="password123")
        self.user2 = User.objects.create_user(username="user2", email="user2@example.com", password="password123")

    def test_user_list(self):
        url = reverse('user-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that the response is paginated
        self.assertIn('results', response.data)
        self.assertIsInstance(response.data['results'], list)
        self.assertGreaterEqual(len(response.data['results']), 2)

    def test_user_create_valid(self):
        url = reverse('user-list-create')
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword123"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["username"], "newuser")
        self.assertEqual(response.data["email"], "newuser@example.com")
        self.assertNotIn("password", response.data)

        new_user = User.objects.get(username="newuser")
        self.assertTrue(new_user.check_password("newpassword123"))

    def test_user_create_invalid(self):
        url = reverse('user-list-create')
        data = {
            "username": "",  # Invalid
            "email": "invalid@example.com",
            "password": "somepassword"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="invalid@example.com").exists())

    def test_user_create_missing_fields(self):
        url = reverse('user-list-create')
        data = {
            "username": "partialuser"
            # Missing email and password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="partialuser").exists())

    def test_user_str(self):
        user = User.objects.get(username="user1")
        self.assertEqual(str(user), "user1")
