# Generated by Django 5.1.3 on 2024-11-27 23:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("journaling", "0005_alter_cognitiveexercise_options_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="journaling",
            options={"ordering": ["-created_at"]},
        ),
        migrations.AlterModelOptions(
            name="meditation",
            options={"ordering": ["-created_at"]},
        ),
        migrations.AlterModelOptions(
            name="problemsolvingsession",
            options={"ordering": ["-scheduled_time"]},
        ),
    ]
