# Generated by Django 5.1.3 on 2024-12-19 17:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("journaling", "0007_alter_meditation_audio_url"),
    ]

    operations = [
        migrations.RenameField(
            model_name="problemsolvingsession",
            old_name="notes",
            new_name="notes_after",
        ),
        migrations.AddField(
            model_name="problemsolvingsession",
            name="completed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="problemsolvingsession",
            name="notes_before",
            field=models.TextField(blank=True, null=True),
        ),
    ]
