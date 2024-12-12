from rest_framework.generics import ListCreateAPIView
from .models import User
from .serializers import UsersSerializer

class UserListCreateView(ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UsersSerializer
