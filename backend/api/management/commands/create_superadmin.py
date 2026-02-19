"""
Management command to create the platform super admin user.
Usage: python manage.py create_superadmin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Profile


class Command(BaseCommand):
    help = 'Create the platform super admin user with profile'

    def handle(self, *args, **options):
        username = 'sait27'
        email = 'admin@portfolio.dev'
        password = 'admin'

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists.'))
            user = User.objects.get(username=username)
        else:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
            )
            self.stdout.write(self.style.SUCCESS(f'Created superuser: {username}'))

        # Create or update profile
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': 'Sait',
                'username_slug': username,
                'email': email,
                'tagline': 'Full-Stack Developer',
                'is_platform_admin': True,
            }
        )
        if not created:
            profile.is_platform_admin = True
            profile.save()
            self.stdout.write(self.style.SUCCESS('Updated existing profile with platform admin flag.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Created profile: @{username} (platform admin)'))

        self.stdout.write(self.style.SUCCESS(f'\n  Login: {username} / {password}'))
        self.stdout.write(self.style.SUCCESS(f'  Portfolio URL: /{username}'))
