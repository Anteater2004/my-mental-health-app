# Generated by Django 5.1.3 on 2024-12-20 06:52

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("journaling", "0009_problemsolvingsession_created_at"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="cognitiveexercise",
            options={"ordering": ["-created_at"]},
        ),
        migrations.AlterField(
            model_name="journaling",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="journals",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="meditation",
            name="duration",
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name="problemsolvingsession",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="problem_solutions",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
