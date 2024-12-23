# users/views.py

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView, GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User
from .serializers import (
    UsersSerializer,
    UserProfileSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.template.loader import render_to_string

class UserListCreateView(ListCreateAPIView):
    """
    Handles user registration.
    """
    queryset = User.objects.all()
    serializer_class = UsersSerializer
    permission_classes = [AllowAny]  # Allow anyone to register

class UserProfileView(RetrieveUpdateAPIView):
    """
    Allows authenticated users to retrieve and update their profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# Password Reset Views

class PasswordResetRequestView(GenericAPIView):
    """
    Handles password reset requests by sending a reset link to the user's email.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = get_user_model().objects.filter(email=email).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # Construct the password reset link pointing to the frontend
            reset_link = f"http://localhost:3000/password_reset/confirm/?uid={uid}&token={token}"
            subject = 'Password Reset Request'
            message = render_to_string('password_reset_email.html', {
                'user': user,
                'reset_link': reset_link,
            })
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        # Always respond with a success message to prevent email enumeration
        return Response(
            {'message': 'If an account with that email exists, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )

class PasswordResetVerifyView(GenericAPIView):
    """
    Verifies the validity of the password reset token.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer  # Not strictly necessary here

    def post(self, request):
        uid = request.query_params.get('uid')
        token = request.query_params.get('token')
        if not uid or not token:
            return Response({'error': 'UID and token are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            user = None
        if user and default_token_generator.check_token(user, token):
            return Response({'message': 'Token is valid.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(GenericAPIView):
    """
    Confirms the password reset by setting a new password.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({'error': 'Invalid UID.'}, status=status.HTTP_400_BAD_REQUEST)
        if user and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
