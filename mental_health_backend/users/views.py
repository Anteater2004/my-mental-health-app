from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from .models import User
from .serializers import UsersSerializer, UserProfileSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated

class UserListCreateView(ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UsersSerializer
    permission_classes = [AllowAny]  # Allow anyone to register

class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
