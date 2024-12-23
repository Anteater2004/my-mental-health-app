# users/urls.py

from django.urls import path
from .views import (
    UserListCreateView,
    UserProfileView,
    PasswordResetRequestView,
    PasswordResetVerifyView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path('', UserListCreateView.as_view(), name='user-list-create'),  # Registration
    path('profile/', UserProfileView.as_view(), name='user-profile'),  # Profile management

    # Password Reset Endpoints
    path('password_reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password_reset/verify/', PasswordResetVerifyView.as_view(), name='password-reset-verify'),
    path('password_reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
