from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_profile_phone'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='portfolio_visibility',
            field=models.CharField(
                choices=[
                    ('public', 'Public'),
                    ('unlisted', 'Unlisted'),
                    ('private', 'Private'),
                ],
                default='public',
                help_text='Public, unlisted, or private portfolio access.',
                max_length=16,
            ),
        ),
    ]
