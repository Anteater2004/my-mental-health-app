from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django_rest_passwordreset.views import (
    reset_password_request_token,      # Correct function name
    reset_password_validate_token,    # Correct function name
    reset_password_confirm,
)

from mental_health_backend.views import home  # Ensure you have a home view
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# Swagger schema configuration
schema_view = get_schema_view(
    openapi.Info(
        title="Mental Health App API",
        default_version="v1",
        description="API documentation for the Mental Health App",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="support@mentalhealthapp.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # User-related URLs
    path('users/', include('users.urls')),  # User registration, profile management
    
    # Journaling-related URLs
    path('journaling/', include('journaling.urls')),  # Journaling entries, meditations, cognitive exercises
    
    # Goals-related URLs
    path('goals/', include('goals.urls')),  # Goal creation, tracking, reminders, concreteness modules
    
    # Gratitude-related URLs
    path('gratitude/', include('gratitude.urls')),  # Gratitude entries, compassion exercises
    
    # Home view (optional, serves a landing page or basic response)
    path('', home, name='home'),
    
    # API documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),  # Swagger UI
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),  # ReDoc documentation
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),  # Raw JSON schema
    
    # JWT Authentication Endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Password Reset Endpoints
    path('api/password_reset/', reset_password_request_token, name='reset_password_token_create'),
    path('api/password_reset/verify/', reset_password_validate_token, name='reset_password_token_verify'),
    path('api/password_reset/confirm/', reset_password_confirm, name='reset_password_confirm'),
]

