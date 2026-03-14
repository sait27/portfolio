from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.models import (
    Profile, SkillCategory, Skill, Project, Experience,
    Education, Activity, Achievement, Certification,
    BlogPost, Testimonial, Message,
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Clear ALL content for sait27 and re-seed with rich sample data'

    def handle(self, *args, **kwargs):
        username = 'sait27'

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stderr.write(f'User "{username}" does not exist.')
            return

        self.stdout.write(f'Clearing all data for @{username}...')

        # ── Delete all content (profile is kept) ──
        SkillCategory.objects.filter(user=user).delete()
        Project.objects.filter(user=user).delete()
        Experience.objects.filter(user=user).delete()
        Education.objects.filter(user=user).delete()
        Activity.objects.filter(user=user).delete()
        Achievement.objects.filter(user=user).delete()
        Certification.objects.filter(user=user).delete()
        BlogPost.objects.filter(user=user).delete()
        Testimonial.objects.filter(user=user).delete()
        Message.objects.filter(recipient=user).delete()

        self.stdout.write('  All content cleared.')

        # ── Update Profile ──
        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': 'Sai Teja',
                'email': user.email or 'saiteja@example.com',
                'username_slug': username,
            }
        )
        profile.full_name = 'Sai Teja'
        profile.tagline = 'Full-Stack Developer | Python · React · Cloud'
        profile.bio = (
            'Passionate full-stack developer with expertise in building scalable web applications, '
            'REST APIs, and modern UI experiences. I specialize in Python, Django, React, and cloud '
            'technologies. When I\'m not coding, I enjoy mentoring junior developers and contributing '
            'to open-source projects.'
        )
        profile.email = user.email or 'saiteja@example.com'
        profile.github_url = 'https://github.com/sait27'
        profile.linkedin_url = 'https://linkedin.com/in/sait27'
        profile.is_platform_admin = True
        profile.save()
        self.stdout.write('  Profile updated.')

        # ── Skills ──
        skill_map = {}
        categories = [
            ('Frontend', 1, ['React', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS']),
            ('Backend', 2, ['Python', 'Django', 'Django REST Framework', 'Node.js', 'FastAPI']),
            ('Database', 3, ['PostgreSQL', 'MongoDB', 'Redis', 'SQLite']),
            ('Cloud & DevOps', 4, ['AWS', 'Docker', 'GitHub Actions', 'Nginx', 'Linux']),
            ('Tools & Other', 5, ['Git', 'VS Code', 'Figma', 'Postman', 'Jira']),
        ]
        for cat_name, order, skills in categories:
            cat = SkillCategory.objects.create(user=user, name=cat_name, order=order)
            for i, skill_name in enumerate(skills):
                s = Skill.objects.create(user=user, name=skill_name, category=cat, order=i)
                skill_map[skill_name] = s
        self.stdout.write(f'  Created {len(skill_map)} skills in {len(categories)} categories.')

        # ── Projects ──
        projects_data = [
            {
                'title': 'PortfolioHub',
                'short_description': 'A multi-tenant portfolio platform with user dashboards, public profiles, and admin panel.',
                'description': '## PortfolioHub\n\nA full-featured portfolio platform that lets developers create and manage stunning portfolios.\n\n### Features\n- User registration and authentication\n- Dashboard with CRUD for projects, skills, experience\n- Public portfolio pages with custom URLs\n- Super admin panel for platform management\n- Resume upload and autofill\n- Contact form with spam protection',
                'category': 'fullstack',
                'is_featured': True,
                'live_url': 'https://portfoliohub.dev',
                'repo_url': 'https://github.com/sait27/portfolio',
                'tech': ['React', 'Django', 'PostgreSQL', 'AWS'],
                'date_built': date(2025, 12, 15),
            },
            {
                'title': 'TaskFlow',
                'short_description': 'Real-time project management tool with Kanban boards and team collaboration.',
                'description': '## TaskFlow\n\nA modern project management application inspired by Trello and Jira.\n\n### Features\n- Drag-and-drop Kanban boards\n- Real-time updates via WebSockets\n- Team workspaces and permissions\n- Sprint planning and analytics',
                'category': 'fullstack',
                'is_featured': True,
                'repo_url': 'https://github.com/sait27/taskflow',
                'tech': ['React', 'Node.js', 'MongoDB', 'Redis'],
                'date_built': date(2025, 8, 20),
            },
            {
                'title': 'CloudDeploy CLI',
                'short_description': 'A CLI tool for one-command deployment of web apps to AWS, GCP, and Azure.',
                'description': '## CloudDeploy CLI\n\nSimplifies cloud deployment with intelligent configuration detection and zero-downtime deploys.\n\n### Features\n- Auto-detects project type (Django, Node, static)\n- Generates Docker configs on-the-fly\n- Supports rollback and blue-green deployments',
                'category': 'automation',
                'is_featured': False,
                'repo_url': 'https://github.com/sait27/clouddeploy',
                'tech': ['Python', 'Docker', 'AWS'],
                'date_built': date(2025, 5, 10),
            },
            {
                'title': 'DevBlog Engine',
                'short_description': 'A lightweight markdown-powered blogging engine with RSS feeds and SEO.',
                'description': '## DevBlog Engine\n\nA minimalistic blog engine designed for developers who write in Markdown.\n\n### Features\n- Markdown rendering with code highlighting\n- Built-in RSS and sitemap generation\n- SEO-optimized server-side rendering\n- Reading time estimation',
                'category': 'backend',
                'is_featured': True,
                'repo_url': 'https://github.com/sait27/devblog',
                'tech': ['Python', 'FastAPI', 'PostgreSQL'],
                'date_built': date(2025, 3, 1),
            },
            {
                'title': 'UI Component Library',
                'short_description': 'An accessible React component library with dark mode support and animations.',
                'description': '## UI Component Library\n\nA reusable component library for React applications.\n\n### Features\n- 30+ accessible components\n- Dark/light theme with CSS variables\n- Framer Motion animations\n- Full TypeScript support',
                'category': 'frontend',
                'is_featured': False,
                'repo_url': 'https://github.com/sait27/ui-kit',
                'tech': ['React', 'TypeScript', 'CSS3'],
                'date_built': date(2024, 11, 5),
            },
        ]
        for i, pd in enumerate(projects_data):
            p = Project.objects.create(
                user=user, title=pd['title'], short_description=pd['short_description'],
                description=pd['description'], category=pd['category'],
                is_featured=pd['is_featured'], is_visible=True, order=i,
                live_url=pd.get('live_url', ''), repo_url=pd.get('repo_url', ''),
                date_built=pd.get('date_built'),
            )
            for tech_name in pd.get('tech', []):
                if tech_name in skill_map:
                    p.tech_stack.add(skill_map[tech_name])
        self.stdout.write(f'  Created {len(projects_data)} projects.')

        # ── Experience ──
        experiences = [
            {
                'role': 'Senior Full-Stack Developer',
                'company': 'TechVision Inc.',
                'start_date': date(2024, 1, 1),
                'is_current': True,
                'highlights': [
                    'Architected microservices backend serving 50K+ daily users',
                    'Reduced API response times by 40% through caching strategies',
                    'Led migration from monolith to containerized architecture',
                    'Mentored team of 4 junior developers',
                ],
            },
            {
                'role': 'Backend Developer',
                'company': 'DataStream Solutions',
                'start_date': date(2022, 6, 1),
                'end_date': date(2023, 12, 31),
                'highlights': [
                    'Built real-time data processing pipelines with Python and Redis',
                    'Designed RESTful APIs consumed by mobile and web clients',
                    'Implemented CI/CD pipelines reducing deployment time by 60%',
                ],
            },
            {
                'role': 'Junior Developer',
                'company': 'WebCraft Agency',
                'start_date': date(2021, 3, 1),
                'end_date': date(2022, 5, 31),
                'highlights': [
                    'Developed responsive websites for 15+ clients using React',
                    'Integrated third-party APIs including Stripe, SendGrid, and Twilio',
                    'Participated in agile sprints and code reviews',
                ],
            },
        ]
        for i, exp in enumerate(experiences):
            Experience.objects.create(user=user, order=i, **exp)
        self.stdout.write(f'  Created {len(experiences)} experience entries.')

        # ── Education ──
        educations = [
            {
                'institution': 'National Institute of Technology',
                'degree': 'Bachelor of Technology',
                'field_of_study': 'Computer Science and Engineering',
                'start_date': date(2017, 8, 1),
                'end_date': date(2021, 5, 30),
                'grade': 'CGPA: 8.7/10',
                'description': 'Focused on algorithms, data structures, distributed systems, and machine learning.',
            },
            {
                'institution': 'Delhi Public School',
                'degree': 'Higher Secondary (XII)',
                'field_of_study': 'Science (PCM)',
                'start_date': date(2015, 4, 1),
                'end_date': date(2017, 3, 31),
                'grade': '94.2%',
            },
        ]
        for i, edu in enumerate(educations):
            Education.objects.create(user=user, order=i, **edu)
        self.stdout.write(f'  Created {len(educations)} education entries.')

        # ── Activities ──
        activities = [
            {
                'title': 'Open Source Contributor',
                'organization': 'Django Software Foundation',
                'role': 'Contributor',
                'start_date': date(2023, 1, 1),
                'is_current': True,
                'highlights': ['Submitted 12 pull requests to Django core', 'Reviewed community contributions'],
            },
            {
                'title': 'Technical Workshop Lead',
                'organization': 'College Coding Club',
                'role': 'Lead Instructor',
                'start_date': date(2019, 8, 1),
                'end_date': date(2021, 5, 1),
                'highlights': ['Conducted 20+ workshops on web development', 'Grew membership from 30 to 150 students'],
            },
        ]
        for i, act in enumerate(activities):
            Activity.objects.create(user=user, order=i, **act)
        self.stdout.write(f'  Created {len(activities)} activities.')

        # ── Achievements ──
        achievements = [
            {
                'title': 'Winner — National Hackathon 2023',
                'issuer': 'HackIndia',
                'achieved_on': date(2023, 9, 15),
                'description': 'Built an AI-powered code reviewer in 36 hours. Won 1st place among 200+ teams.',
            },
            {
                'title': 'Top 5% on LeetCode',
                'issuer': 'LeetCode',
                'achieved_on': date(2024, 3, 1),
                'description': 'Solved 500+ problems. Rating: 2100+ (Knight).',
            },
            {
                'title': 'Best Graduation Project Award',
                'issuer': 'NIT Department of CSE',
                'achieved_on': date(2021, 5, 30),
                'description': 'Thesis: "Scalable Real-Time Analytics Dashboard for IoT Sensor Networks".',
            },
        ]
        for i, ach in enumerate(achievements):
            Achievement.objects.create(user=user, order=i, **ach)
        self.stdout.write(f'  Created {len(achievements)} achievements.')

        # ── Certifications ──
        certifications = [
            {
                'name': 'AWS Certified Solutions Architect – Associate',
                'issuer': 'Amazon Web Services',
                'issue_date': date(2024, 6, 15),
                'expiry_date': date(2027, 6, 15),
                'credential_id': 'AWS-SAA-2024-XXXXX',
                'skills': ['AWS', 'Cloud Architecture', 'EC2', 'S3'],
            },
            {
                'name': 'Meta Back-End Developer Professional Certificate',
                'issuer': 'Meta / Coursera',
                'issue_date': date(2023, 11, 1),
                'credential_id': 'META-BE-2023-XXXXX',
                'skills': ['Python', 'Django', 'REST APIs', 'Databases'],
            },
            {
                'name': 'Docker Certified Associate',
                'issuer': 'Docker Inc.',
                'issue_date': date(2024, 2, 10),
                'credential_id': 'DCA-2024-XXXXX',
                'skills': ['Docker', 'Containers', 'Docker Compose'],
            },
        ]
        for i, cert in enumerate(certifications):
            Certification.objects.create(user=user, order=i, **cert)
        self.stdout.write(f'  Created {len(certifications)} certifications.')

        # ── Blog Posts ──
        now = timezone.now()
        blogs = [
            {
                'title': 'Building Scalable REST APIs with Django REST Framework',
                'excerpt': 'A deep dive into designing robust APIs with pagination, filtering, throttling, and authentication.',
                'content': '# Building Scalable REST APIs with Django REST Framework\n\nDjango REST Framework (DRF) is the go-to toolkit for building web APIs in Python...\n\n## Key Concepts\n\n### 1. Serializers\nSerializers handle data validation and transformation...\n\n### 2. ViewSets & Routers\nViewSets reduce boilerplate by combining list, create, retrieve, update, and destroy actions...\n\n### 3. Authentication & Permissions\nDRF supports JWT, Session, Token, and custom authentication backends...\n\n### 4. Throttling\nRate limiting protects your API from abuse...\n\n## Conclusion\nDRF provides all the pieces you need to build production-grade APIs.',
                'tags': ['Django', 'Python', 'REST API', 'Backend'],
                'read_time': '8 min read',
                'is_published': True,
                'published_at': now - timedelta(days=10),
            },
            {
                'title': 'React Performance Optimization: Beyond Memo',
                'excerpt': 'Practical techniques for React performance that go beyond React.memo and useMemo.',
                'content': '# React Performance Optimization: Beyond Memo\n\nPerformance tuning in React requires understanding the render cycle deeply...\n\n## Techniques\n\n### 1. Code Splitting\nUse `React.lazy()` and Suspense to split your bundle...\n\n### 2. Virtualization\nFor long lists, use `react-window` or `react-virtuoso`...\n\n### 3. State Colocation\nKeep state as close to where it\'s used as possible...\n\n## Conclusion\nProfiling first, optimizing second is the key principle.',
                'tags': ['React', 'JavaScript', 'Performance', 'Frontend'],
                'read_time': '6 min read',
                'is_published': True,
                'published_at': now - timedelta(days=25),
            },
            {
                'title': 'Docker for Django Developers: A Practical Guide',
                'excerpt': 'Step-by-step guide to containerizing Django apps with Docker and Docker Compose.',
                'content': '# Docker for Django Developers\n\nContainerization simplifies deployment and ensures consistency across environments...\n\n## Setup\n\n### Dockerfile\n```dockerfile\nFROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ["gunicorn", "config.wsgi:application"]\n```\n\n### Docker Compose\nOrchestrate Django, PostgreSQL, and Redis together...\n\n## Conclusion\nDocker eliminates "works on my machine" problems entirely.',
                'tags': ['Docker', 'Django', 'DevOps'],
                'read_time': '7 min read',
                'is_published': True,
                'published_at': now - timedelta(days=45),
            },
        ]
        for blog in blogs:
            BlogPost.objects.create(user=user, **blog)
        self.stdout.write(f'  Created {len(blogs)} blog posts.')

        # ── Testimonials ──
        testimonials = [
            {
                'client_name': 'Priya Sharma',
                'client_role': 'Product Manager',
                'client_company': 'TechVision Inc.',
                'content': 'Sai is an exceptional developer who consistently delivers high-quality code. His ability to architect scalable solutions while keeping things simple is remarkable. A true asset to any team.',
                'rating': 5,
                'project_name': 'Enterprise Dashboard',
                'is_featured': True,
            },
            {
                'client_name': 'Rahul Verma',
                'client_role': 'CTO',
                'client_company': 'StartupNow',
                'content': 'We hired Sai to build our MVP and he delivered ahead of schedule. The code quality was production-ready from day one. He also helped us set up CI/CD which saved us hours every week.',
                'rating': 5,
                'project_name': 'MVP Development',
                'is_featured': True,
            },
            {
                'client_name': 'Ananya Reddy',
                'client_role': 'Design Lead',
                'client_company': 'PixelPerfect Studio',
                'content': 'Working with Sai was a pleasure. He translated our designs into pixel-perfect, responsive interfaces. His attention to detail and clean code practices made collaboration seamless.',
                'rating': 4,
                'project_name': 'UI Component Library',
                'is_featured': False,
            },
        ]
        for i, t in enumerate(testimonials):
            Testimonial.objects.create(user=user, order=i, **t)
        self.stdout.write(f'  Created {len(testimonials)} testimonials.')

        # ── Messages ──
        messages = [
            {
                'sender_name': 'Vikram Patel',
                'sender_email': 'vikram@example.com',
                'subject': 'Freelance opportunity — React + Django project',
                'content': 'Hi Sai, I saw your portfolio and I am impressed with your work. We have a 3-month project building a SaaS dashboard. Would you be interested in discussing?',
                'is_read': False,
            },
            {
                'sender_name': 'Meera Iyer',
                'sender_email': 'meera@example.com',
                'subject': 'Speaking invitation — PyCon India 2025',
                'content': 'Hello Sai! We would love to have you speak at PyCon India 2025 about building scalable Django APIs. Let me know if you are interested!',
                'is_read': False,
            },
            {
                'sender_name': 'Arjun Nair',
                'sender_email': 'arjun@example.com',
                'subject': 'Great blog post on Docker!',
                'content': 'Just wanted to say your Docker article was exactly what I needed. Clear, practical, and well-structured. Keep writing!',
                'is_read': True,
            },
        ]
        for msg in messages:
            Message.objects.create(recipient=user, **msg)
        self.stdout.write(f'  Created {len(messages)} messages.')

        self.stdout.write(self.style.SUCCESS(
            f'\nSeed complete for @{username}! '
            f'({len(skill_map)} skills, {len(projects_data)} projects, '
            f'{len(experiences)} experience, {len(educations)} education, '
            f'{len(activities)} activities, {len(achievements)} achievements, '
            f'{len(certifications)} certs, {len(blogs)} blogs, '
            f'{len(testimonials)} testimonials, {len(messages)} messages)'
        ))
