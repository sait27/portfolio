from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Profile, SkillCategory, Skill, Project, Experience, BlogPost, Testimonial

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed portfolio data for sait27'

    def handle(self, *args, **kwargs):
        # Get or create user
        user, created = User.objects.get_or_create(
            username='sait27',
            defaults={'email': 'sait27@example.com'}
        )
        if created:
            user.set_password('admin123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: sait27'))
        
        # Profile
        profile, _ = Profile.objects.update_or_create(
            user=user,
            defaults={
                'full_name': 'Sait Ahmed',
                'tagline': 'Full Stack Developer & UI/UX Enthusiast',
                'bio': 'Passionate full-stack developer with 5+ years of experience building scalable web applications. Specialized in React, Django, and cloud technologies. Love creating beautiful, user-friendly interfaces that solve real problems.',
                'github_url': 'https://github.com/sait27',
                'linkedin_url': 'https://linkedin.com/in/sait27',
                'twitter_url': 'https://twitter.com/sait27',
            }
        )
        
        # Skills
        frontend = SkillCategory.objects.get_or_create(user=user, name='Frontend', order=1)[0]
        backend = SkillCategory.objects.get_or_create(user=user, name='Backend', order=2)[0]
        tools = SkillCategory.objects.get_or_create(user=user, name='Tools & DevOps', order=3)[0]
        
        frontend_skills = ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux']
        backend_skills = ['Django', 'Python', 'PostgreSQL', 'REST APIs', 'GraphQL']
        tool_skills = ['Docker', 'AWS', 'Git', 'CI/CD', 'Linux']
        
        for skill_name in frontend_skills:
            Skill.objects.get_or_create(user=user, category=frontend, name=skill_name)
        
        for skill_name in backend_skills:
            Skill.objects.get_or_create(user=user, category=backend, name=skill_name)
        
        for skill_name in tool_skills:
            Skill.objects.get_or_create(user=user, category=tools, name=skill_name)
        
        # Projects
        projects_data = [
            {
                'title': 'E-Commerce Platform',
                'short_description': 'Full-featured online shopping platform with payment integration',
                'description': 'Built a complete e-commerce solution with product management, shopping cart, payment processing, and order tracking.',
                'category': 'fullstack',
                'live_url': 'https://demo-ecommerce.com',
                'repo_url': 'https://github.com/sait27/ecommerce',
                'is_featured': True,
                'order': 1
            },
            {
                'title': 'Task Management App',
                'short_description': 'Collaborative task management tool for teams',
                'description': 'Real-time task management application with team collaboration features, notifications, and analytics.',
                'category': 'fullstack',
                'live_url': 'https://demo-tasks.com',
                'repo_url': 'https://github.com/sait27/taskapp',
                'is_featured': True,
                'order': 2
            },
            {
                'title': 'Portfolio CMS',
                'short_description': 'Content management system for developers',
                'description': 'A modern CMS built specifically for developers to showcase their work and manage their portfolio content.',
                'category': 'backend',
                'repo_url': 'https://github.com/sait27/portfolio-cms',
                'is_featured': False,
                'order': 3
            }
        ]
        
        for proj_data in projects_data:
            Project.objects.get_or_create(
                user=user,
                title=proj_data['title'],
                defaults=proj_data
            )
        
        # Experience
        experiences_data = [
            {
                'company': 'Tech Innovations Inc.',
                'role': 'Senior Full Stack Developer',
                'start_date': '2022-01-01',
                'is_current': True,
                'highlights': [
                    'Led development of microservices architecture serving 1M+ users',
                    'Reduced API response time by 40% through optimization',
                    'Mentored 5 junior developers'
                ],
                'order': 1
            },
            {
                'company': 'StartupXYZ',
                'role': 'Full Stack Developer',
                'start_date': '2020-03-01',
                'end_date': '2021-12-31',
                'highlights': [
                    'Built MVP from scratch using React and Django',
                    'Implemented CI/CD pipeline reducing deployment time by 60%',
                    'Integrated third-party APIs for payment and analytics'
                ],
                'order': 2
            },
            {
                'company': 'Digital Agency Co.',
                'role': 'Junior Developer',
                'start_date': '2019-01-01',
                'end_date': '2020-02-29',
                'highlights': [
                    'Developed responsive websites for 20+ clients',
                    'Collaborated with designers to implement pixel-perfect UIs',
                    'Maintained and updated legacy codebases'
                ],
                'order': 3
            }
        ]
        
        for exp_data in experiences_data:
            Experience.objects.get_or_create(
                user=user,
                company=exp_data['company'],
                role=exp_data['role'],
                defaults=exp_data
            )
        
        # Blog Posts
        blogs_data = [
            {
                'title': 'Building Scalable React Applications',
                'excerpt': 'Learn best practices for structuring large React applications that scale.',
                'content': 'In this post, we explore architectural patterns and best practices for building React applications that can grow with your team and user base...',
                'tags': ['React', 'JavaScript', 'Architecture'],
                'read_time': '8 min read',
                'is_published': True,
                'is_featured': True
            },
            {
                'title': 'Django REST Framework Tips',
                'excerpt': 'Essential tips and tricks for building better APIs with Django REST Framework.',
                'content': 'Django REST Framework is powerful, but there are many hidden features that can make your API development faster and more efficient...',
                'tags': ['Django', 'Python', 'API'],
                'read_time': '6 min read',
                'is_published': True,
                'is_featured': False
            }
        ]
        
        for blog_data in blogs_data:
            BlogPost.objects.get_or_create(
                user=user,
                title=blog_data['title'],
                defaults=blog_data
            )
        
        # Testimonials
        testimonials_data = [
            {
                'client_name': 'Sarah Johnson',
                'client_role': 'Product Manager',
                'client_company': 'Tech Innovations Inc.',
                'content': 'Sait is an exceptional developer who consistently delivers high-quality work. His attention to detail and problem-solving skills are outstanding.',
                'rating': 5,
                'is_featured': True,
                'order': 1
            },
            {
                'client_name': 'Michael Chen',
                'client_role': 'CTO',
                'client_company': 'StartupXYZ',
                'content': 'Working with Sait was a pleasure. He built our MVP quickly and efficiently, and his code quality is excellent. Highly recommended!',
                'rating': 5,
                'is_featured': True,
                'order': 2
            },
            {
                'client_name': 'Emily Rodriguez',
                'client_role': 'Design Lead',
                'client_company': 'Digital Agency Co.',
                'content': 'Sait has great collaboration skills and always implements designs perfectly. A true professional who cares about the end result.',
                'rating': 5,
                'is_featured': False,
                'order': 3
            }
        ]
        
        for test_data in testimonials_data:
            Testimonial.objects.get_or_create(
                user=user,
                client_name=test_data['client_name'],
                defaults=test_data
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded portfolio data for sait27'))
