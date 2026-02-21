from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Profile, SkillCategory, Skill

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with default skill categories and sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...\n')

        # Create default user if none exists
        user, created = User.objects.get_or_create(
            username='demo',
            defaults={'email': 'demo@example.com'}
        )
        if created:
            user.set_password('demo123')
            user.save()
            self.stdout.write(f'Created demo user')

        # Create profile
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': 'Demo User',
                'tagline': 'Full Stack Developer',
                'email': user.email
            }
        )
        if created:
            self.stdout.write(f'Created profile for {user.username}')

        # ── Seed Skill Categories ─────────────────────────────────────
        categories_data = [
            {'name': 'Frontend', 'order': 1},
            {'name': 'Backend', 'order': 2},
            {'name': 'Database', 'order': 3},
            {'name': 'DevOps', 'order': 4},
            {'name': 'Tools', 'order': 5},
        ]

        for cat_data in categories_data:
            cat, created = SkillCategory.objects.get_or_create(
                user=user,
                name=cat_data['name'],
                defaults={'order': cat_data['order']}
            )
            status = 'Created' if created else 'Exists'
            self.stdout.write(f'  {status}: Category "{cat.name}"')

        # ── Seed Some Skills ──────────────────────────────────────────
        skills_data = [
            ('Python', 'Backend'),
            ('Django', 'Backend'),
            ('JavaScript', 'Frontend'),
            ('React', 'Frontend'),
            ('PostgreSQL', 'Database'),
            ('Git', 'Tools'),
            ('Docker', 'DevOps'),
        ]

        for skill_name, cat_name in skills_data:
            category = SkillCategory.objects.get(user=user, name=cat_name)
            skill, created = Skill.objects.get_or_create(
                user=user,
                name=skill_name,
                category=category,
            )
            status = 'Created' if created else 'Exists'
            self.stdout.write(f'  {status}: Skill "{skill.name}"')

        self.stdout.write(self.style.SUCCESS('\nSeed complete!'))