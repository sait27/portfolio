import os
from django.core.management.base import BaseCommand
from api.models import Profile, SkillCategory, Skill, Experience


class Command(BaseCommand):
    help = 'Seed the database with default skill categories and sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...\n')

        # ── Seed Skill Categories ─────────────────────────────────────
        categories_data = [
            {'name': 'Frontend', 'order': 1},
            {'name': 'Backend', 'order': 2},
            {'name': 'Database', 'order': 3},
            {'name': 'DevOps', 'order': 4},
            {'name': 'AI Models', 'order': 5},
            {'name': 'IDEs', 'order': 6},
            {'name': 'Tools', 'order': 7},
        ]

        for cat_data in categories_data:
            cat, created = SkillCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'order': cat_data['order']}
            )
            status = 'Created' if created else 'Exists'
            self.stdout.write(f'  {status}: Category "{cat.name}"')

        # ── Seed Some Skills ──────────────────────────────────────────
        skills_data = [
            ('Python', 'Backend'),
            ('Django', 'Backend'),
            ('Flask', 'Backend'),
            ('Django REST Framework', 'Backend'),
            ('JavaScript', 'Frontend'),
            ('React', 'Frontend'),
            ('HTML/CSS', 'Frontend'),
            ('PostgreSQL', 'Database'),
            ('SQLite', 'Database'),
            ('Git', 'Tools'),
            ('Docker', 'DevOps'),
            ('VS Code', 'IDEs'),
            ('PyCharm', 'IDEs'),
        ]

        for skill_name, cat_name in skills_data:
            category = SkillCategory.objects.get(name=cat_name)
            skill, created = Skill.objects.get_or_create(
                name=skill_name,
                category=category,
            )
            status = 'Created' if created else 'Exists'
            self.stdout.write(f'  {status}: Skill "{skill.name}"')

        self.stdout.write(self.style.SUCCESS('\nSeed complete!'))
