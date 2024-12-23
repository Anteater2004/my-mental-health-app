from django.contrib import admin
from .models import Prompt, UserResponse, Insight, SwipeSession

@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    """
    Admin interface for the Prompt model.
    """
    list_display = ('text', 'category', 'created_at')
    search_fields = ('text', 'category')
    list_filter = ('category', 'created_at')
    ordering = ('-created_at',)
    # Removed 'fields' since 'fieldsets' are defined
    fieldsets = (
        (None, {
            'fields': ('text', 'category')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

@admin.register(UserResponse)
class UserResponseAdmin(admin.ModelAdmin):
    """
    Admin interface for the UserResponse model.
    """
    list_display = ('user', 'prompt', 'response', 'timestamp', 'session')
    search_fields = ('user__username', 'prompt__text')
    list_filter = ('response', 'timestamp', 'session')
    ordering = ('-timestamp',)
    readonly_fields = ('timestamp',)
    fields = ('user', 'prompt', 'response', 'session', 'timestamp', 'feedback')

@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    """
    Admin interface for the Insight model.
    """
    list_display = ('user', 'short_content', 'generated_at', 'confidence_score', 'reviewed')
    search_fields = ('user__username', 'content')
    list_filter = ('generated_at', 'confidence_score', 'reviewed')
    ordering = ('-generated_at',)
    readonly_fields = ('user', 'content', 'generated_at', 'confidence_score', 'reviewed')
    fields = ('user', 'content', 'confidence_score', 'generated_at', 'reviewed')

    def short_content(self, obj):
        """
        Returns a truncated version of the insight content for display.
        """
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    short_content.short_description = 'Content Preview'

@admin.register(SwipeSession)
class SwipeSessionAdmin(admin.ModelAdmin):
    """
    Admin interface for the SwipeSession model.
    """
    list_display = ('user', 'created_at', 'completed')
    search_fields = ('user__username',)
    list_filter = ('completed', 'created_at')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    fields = ('user', 'created_at', 'completed')
