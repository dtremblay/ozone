# Generated by Django 2.2.1 on 2019-10-16 19:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('widgets', '0002_widgetdefinition_intents'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='widgetdefinition',
            name='intents',
        ),
    ]
