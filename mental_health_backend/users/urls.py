from django.urls import path
from .views import UserListCreateView, UserProfileView

urlpatterns = [
    path('', UserListCreateView.as_view(), name='user-list-create'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
