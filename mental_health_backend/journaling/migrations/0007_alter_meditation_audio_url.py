# Generated by Django 5.1.3 on 2024-12-18 10:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "journaling",
            "0006_alter_journaling_options_alter_meditation_options_and_more",
        ),
    ]

    operations = [
        migrations.AlterField(
            model_name="meditation",
            name="audio_url",
            field=models.URLField(blank=True, null=True),
        ),
    ]
