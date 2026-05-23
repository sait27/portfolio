from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_profile_website_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='phone',
            field=models.CharField(blank=True, max_length=32),
        ),
    ]
