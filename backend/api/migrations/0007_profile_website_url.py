from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_profile_dashboard_section_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='website_url',
            field=models.URLField(blank=True),
        ),
    ]
