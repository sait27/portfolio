from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import (
    Achievement,
    Activity,
    BlogPost,
    Certification,
    Education,
    Experience,
    Profile,
    Project,
    Skill,
    SkillCategory,
    Testimonial,
)

User = get_user_model()


class Command(BaseCommand):
    help = "Seed rich portfolio data for sait27 (idempotent)"

    def handle(self, *args, **kwargs):
        user, created = User.objects.get_or_create(
            username="sait27",
            defaults={"email": "sait27@example.com"},
        )
        if created:
            user.set_password("admin123")
            user.save(update_fields=["password"])
            self.stdout.write(self.style.SUCCESS("Created user: sait27"))
        elif not user.email:
            user.email = "sait27@example.com"
            user.save(update_fields=["email"])

        Profile.objects.update_or_create(
            user=user,
            defaults={
                "full_name": "Sait Ahmed",
                "tagline": "Full Stack Engineer building fast, reliable product experiences",
                "bio": (
                    "Product-focused full-stack developer with 6+ years of experience delivering "
                    "frontend-heavy SaaS applications, scalable APIs, and developer platforms."
                ),
                "email": user.email or "sait27@example.com",
                "github_url": "https://github.com/sait27",
                "linkedin_url": "https://linkedin.com/in/sait27",
                "twitter_url": "https://twitter.com/sait27",
                "show_hero": True,
                "show_about": True,
                "show_highlights": True,
                "show_skills": True,
                "show_projects": True,
                "show_experience": True,
                "show_education": True,
                "show_activities": True,
                "show_achievements": True,
                "show_certifications": True,
                "show_blog": True,
                "show_testimonials": True,
                "show_contact": True,
                "show_nav_about": True,
                "show_nav_skills": True,
                "show_nav_projects": True,
                "show_nav_experience": True,
                "show_nav_education": True,
                "show_nav_activities": True,
                "show_nav_achievements": True,
                "show_nav_certifications": True,
                "show_nav_blog": True,
                "show_nav_testimonials": True,
                "show_nav_contact": True,
            },
        )

        categories = [
            {"name": "Frontend", "order": 1},
            {"name": "Backend", "order": 2},
            {"name": "Cloud & DevOps", "order": 3},
            {"name": "Data & AI", "order": 4},
            {"name": "Tooling", "order": 5},
        ]
        category_map = {}
        for category in categories:
            obj, _ = SkillCategory.objects.update_or_create(
                user=user,
                name=category["name"],
                defaults={"order": category["order"]},
            )
            category_map[category["name"]] = obj

        skills_by_category = {
            "Frontend": [
                "React",
                "TypeScript",
                "Next.js",
                "Redux Toolkit",
                "Tailwind CSS",
                "Framer Motion",
                "HTML5",
                "CSS3",
            ],
            "Backend": [
                "Python",
                "Django",
                "Django REST Framework",
                "Node.js",
                "Express",
                "PostgreSQL",
                "Redis",
                "GraphQL",
            ],
            "Cloud & DevOps": [
                "Docker",
                "Kubernetes",
                "AWS",
                "Terraform",
                "Nginx",
                "GitHub Actions",
                "CI/CD",
            ],
            "Data & AI": [
                "Pandas",
                "NumPy",
                "scikit-learn",
                "OpenAI API",
                "LangChain",
            ],
            "Tooling": [
                "Git",
                "Linux",
                "Postman",
                "Sentry",
                "Jest",
                "Playwright",
            ],
        }

        skill_map = {}
        for category_name, skill_names in skills_by_category.items():
            category = category_map[category_name]
            for order, skill_name in enumerate(skill_names, start=1):
                skill, _ = Skill.objects.update_or_create(
                    user=user,
                    category=category,
                    name=skill_name,
                    defaults={"order": order},
                )
                skill_map[skill_name] = skill

        projects = [
            {
                "title": "Orbit Commerce Suite",
                "short_description": "Headless B2B commerce platform with role-based procurement workflows.",
                "description": (
                    "Built a multi-tenant commerce suite with product catalogs, quote-to-order flow, "
                    "approval ladders, and ERP sync."
                ),
                "category": "fullstack",
                "live_url": "https://demo-orbit-commerce.com",
                "repo_url": "https://github.com/sait27/orbit-commerce",
                "is_featured": True,
                "is_visible": True,
                "order": 1,
                "date_built": date(2025, 8, 1),
                "tech": ["React", "TypeScript", "Django", "PostgreSQL", "Redis", "Docker"],
            },
            {
                "title": "Pulse Hiring Dashboard",
                "short_description": "Recruitment analytics dashboard with interview pipeline automation.",
                "description": (
                    "Designed and implemented a hiring intelligence dashboard with custom KPIs, "
                    "scheduler automations, and interviewer calibration reports."
                ),
                "category": "fullstack",
                "live_url": "https://demo-pulse-hiring.com",
                "repo_url": "https://github.com/sait27/pulse-hiring",
                "is_featured": True,
                "is_visible": True,
                "order": 2,
                "date_built": date(2025, 3, 15),
                "tech": ["Next.js", "Django REST Framework", "PostgreSQL", "Framer Motion"],
            },
            {
                "title": "Ops Automation Engine",
                "short_description": "Workflow engine for nightly data syncs, alerts, and incident triage.",
                "description": (
                    "Created a backend automation system for scheduled data jobs, retries, dead-letter "
                    "queues, and Slack alerts."
                ),
                "category": "automation",
                "live_url": "",
                "repo_url": "https://github.com/sait27/ops-automation-engine",
                "is_featured": True,
                "is_visible": True,
                "order": 3,
                "date_built": date(2024, 12, 12),
                "tech": ["Python", "Django", "Redis", "Docker", "GitHub Actions"],
            },
            {
                "title": "Creator Portfolio CMS",
                "short_description": "Portfolio management platform with visual section toggles and analytics.",
                "description": (
                    "Built a portfolio CMS with auth, content CRUD, publish controls, SEO metadata, "
                    "and contact inbox."
                ),
                "category": "backend",
                "live_url": "",
                "repo_url": "https://github.com/sait27/creator-portfolio-cms",
                "is_featured": False,
                "is_visible": True,
                "order": 4,
                "date_built": date(2024, 6, 8),
                "tech": ["Django", "Django REST Framework", "PostgreSQL", "Nginx"],
            },
            {
                "title": "Realtime Collab Whiteboard",
                "short_description": "Collaborative whiteboard with presence, cursor sync, and rooms.",
                "description": (
                    "Implemented real-time collaboration features including multiplayer drawing, "
                    "sticky notes, and export snapshots."
                ),
                "category": "frontend",
                "live_url": "https://demo-collab-board.com",
                "repo_url": "https://github.com/sait27/realtime-whiteboard",
                "is_featured": False,
                "is_visible": True,
                "order": 5,
                "date_built": date(2024, 2, 20),
                "tech": ["React", "TypeScript", "Redux Toolkit", "CSS3"],
            },
            {
                "title": "API Performance Observatory",
                "short_description": "Service-level metrics explorer with query traces and release overlays.",
                "description": (
                    "Shipped an internal observability view that helped teams investigate P95 regressions "
                    "and map issues to release windows."
                ),
                "category": "backend",
                "live_url": "",
                "repo_url": "https://github.com/sait27/api-observatory",
                "is_featured": False,
                "is_visible": True,
                "order": 6,
                "date_built": date(2023, 11, 5),
                "tech": ["Python", "PostgreSQL", "Pandas", "Docker"],
            },
        ]

        for project in projects:
            tech_names = project.pop("tech")
            project_obj, _ = Project.objects.update_or_create(
                user=user,
                title=project["title"],
                defaults=project,
            )
            project_obj.tech_stack.set([skill_map[name] for name in tech_names if name in skill_map])

        experiences = [
            {
                "company": "Tech Innovations Inc.",
                "role": "Senior Full Stack Engineer",
                "company_url": "https://example.com",
                "start_date": date(2022, 1, 1),
                "end_date": None,
                "is_current": True,
                "highlights": [
                    "Led migration from monolith to service modules reducing deploy risk by 35%.",
                    "Cut API median latency by 42% through query optimization and cache strategy.",
                    "Mentored 6 engineers and established frontend architecture guidelines.",
                ],
                "order": 1,
            },
            {
                "company": "StartupXYZ",
                "role": "Full Stack Developer",
                "company_url": "https://example.com",
                "start_date": date(2020, 3, 1),
                "end_date": date(2021, 12, 31),
                "is_current": False,
                "highlights": [
                    "Built MVP from zero to launch in 12 weeks with a team of 4.",
                    "Implemented CI/CD pipeline that reduced release time by 60%.",
                    "Integrated payments, analytics, and transactional email services.",
                ],
                "order": 2,
            },
            {
                "company": "Digital Agency Co.",
                "role": "Software Engineer",
                "company_url": "https://example.com",
                "start_date": date(2018, 7, 1),
                "end_date": date(2020, 2, 29),
                "is_current": False,
                "highlights": [
                    "Delivered 25+ client projects with accessibility and performance budgets.",
                    "Built reusable UI system that improved team throughput by 30%.",
                    "Partnered with design and QA to lower production bugs release-over-release.",
                ],
                "order": 3,
            },
            {
                "company": "Open Source Collective",
                "role": "Volunteer Maintainer",
                "company_url": "",
                "start_date": date(2017, 1, 1),
                "end_date": date(2018, 6, 1),
                "is_current": False,
                "highlights": [
                    "Maintained issue triage and release notes for community packages.",
                    "Contributed documentation and onboarding improvements.",
                ],
                "order": 4,
            },
        ]

        for exp in experiences:
            Experience.objects.update_or_create(
                user=user,
                company=exp["company"],
                role=exp["role"],
                defaults=exp,
            )

        educations = [
            {
                "institution": "National Institute of Technology",
                "degree": "B.Tech",
                "field_of_study": "Computer Science and Engineering",
                "start_date": date(2014, 8, 1),
                "end_date": date(2018, 5, 31),
                "is_current": False,
                "grade": "8.9/10",
                "description": "Focused on software engineering, distributed systems, and human-computer interaction.",
                "order": 1,
            },
            {
                "institution": "Cloud Academy",
                "degree": "Postgraduate Program",
                "field_of_study": "Cloud Computing",
                "start_date": date(2019, 1, 1),
                "end_date": date(2019, 10, 1),
                "is_current": False,
                "grade": "Distinction",
                "description": "Hands-on labs in AWS networking, infrastructure automation, and observability.",
                "order": 2,
            },
            {
                "institution": "Design Craft School",
                "degree": "Professional Certificate",
                "field_of_study": "Product UX",
                "start_date": date(2021, 2, 1),
                "end_date": date(2021, 8, 1),
                "is_current": False,
                "grade": "A",
                "description": "Practice-driven program on design thinking, prototypes, usability testing, and accessibility.",
                "order": 3,
            },
        ]

        for edu in educations:
            Education.objects.update_or_create(
                user=user,
                institution=edu["institution"],
                degree=edu["degree"],
                defaults=edu,
            )

        activities = [
            {
                "title": "Open Source Mentorship Circle",
                "organization": "CodeForAll",
                "role": "Mentor",
                "start_date": date(2023, 1, 1),
                "end_date": None,
                "is_current": True,
                "highlights": [
                    "Mentored 20+ beginners on pull requests, testing, and release etiquette.",
                    "Ran monthly office hours on debugging and architecture basics.",
                ],
                "description": "Community mentoring initiative helping new contributors ship production-quality contributions.",
                "order": 1,
            },
            {
                "title": "University Hackathon Committee",
                "organization": "NIT Tech Fest",
                "role": "Core Organizer",
                "start_date": date(2016, 7, 1),
                "end_date": date(2018, 4, 1),
                "is_current": False,
                "highlights": [
                    "Scaled event participation from 120 to 450 students.",
                    "Managed sponsor outreach and problem statement curation.",
                ],
                "description": "Organized annual hackathon tracks, judging operations, and student workshops.",
                "order": 2,
            },
            {
                "title": "Developer Community Speaker Series",
                "organization": "DevLoop",
                "role": "Speaker",
                "start_date": date(2022, 2, 1),
                "end_date": None,
                "is_current": True,
                "highlights": [
                    "Delivered talks on frontend architecture and API design.",
                    "Facilitated code reviews and live performance debugging sessions.",
                ],
                "description": "Monthly talks and practical sessions for early to mid-career engineers.",
                "order": 3,
            },
            {
                "title": "NGO Digital Enablement Program",
                "organization": "CivicBridge",
                "role": "Volunteer Engineer",
                "start_date": date(2020, 5, 1),
                "end_date": date(2021, 5, 31),
                "is_current": False,
                "highlights": [
                    "Built lightweight donation forms and volunteer onboarding workflows.",
                    "Reduced manual reporting effort with dashboard automation.",
                ],
                "description": "Volunteer initiative for nonprofit digital transformation support.",
                "order": 4,
            },
        ]

        for activity in activities:
            Activity.objects.update_or_create(
                user=user,
                title=activity["title"],
                organization=activity["organization"],
                defaults=activity,
            )

        achievements = [
            {
                "title": "Winner - National Smart India Build Challenge",
                "issuer": "Innovation Council",
                "achieved_on": date(2024, 9, 15),
                "description": "Led a 4-member team to build a logistics optimization prototype and won first place.",
                "proof_url": "https://example.com/awards/sibc-2024",
                "order": 1,
            },
            {
                "title": "Top Performer Award",
                "issuer": "Tech Innovations Inc.",
                "achieved_on": date(2023, 12, 10),
                "description": "Recognized for consistently shipping high-impact platform improvements across 3 quarters.",
                "proof_url": "https://example.com/awards/top-performer-2023",
                "order": 2,
            },
            {
                "title": "Best Internal Tooling Initiative",
                "issuer": "Engineering Excellence Summit",
                "achieved_on": date(2022, 11, 5),
                "description": "Awarded for developer productivity tooling reducing mean incident triage time.",
                "proof_url": "https://example.com/awards/tooling-initiative",
                "order": 3,
            },
            {
                "title": "Open Source Community Impact Badge",
                "issuer": "CodeForAll",
                "achieved_on": date(2021, 8, 21),
                "description": "Acknowledged for mentorship hours and sustained OSS contributions.",
                "proof_url": "https://example.com/awards/community-impact",
                "order": 4,
            },
        ]

        for achievement in achievements:
            Achievement.objects.update_or_create(
                user=user,
                title=achievement["title"],
                defaults=achievement,
            )

        certifications = [
            {
                "name": "AWS Certified Solutions Architect - Associate",
                "issuer": "Amazon Web Services",
                "issue_date": date(2024, 6, 1),
                "expiry_date": date(2027, 6, 1),
                "credential_id": "AWS-SAA-2024-09XX12",
                "credential_url": "https://example.com/certs/aws-saa",
                "skills": ["AWS", "Cloud Architecture", "Networking"],
                "order": 1,
            },
            {
                "name": "Google Professional Cloud Developer",
                "issuer": "Google Cloud",
                "issue_date": date(2023, 3, 11),
                "expiry_date": date(2026, 3, 11),
                "credential_id": "GCP-PCD-7712",
                "credential_url": "https://example.com/certs/gcp-pcd",
                "skills": ["Cloud Run", "CI/CD", "Observability"],
                "order": 2,
            },
            {
                "name": "Meta Front-End Developer Professional Certificate",
                "issuer": "Meta",
                "issue_date": date(2022, 9, 20),
                "expiry_date": None,
                "credential_id": "META-FE-2022-481",
                "credential_url": "https://example.com/certs/meta-frontend",
                "skills": ["React", "TypeScript", "Accessibility"],
                "order": 3,
            },
            {
                "name": "Certified Kubernetes Application Developer",
                "issuer": "CNCF",
                "issue_date": date(2025, 1, 7),
                "expiry_date": date(2027, 1, 7),
                "credential_id": "CKAD-3119",
                "credential_url": "https://example.com/certs/ckad",
                "skills": ["Kubernetes", "Docker", "DevOps"],
                "order": 4,
            },
        ]

        for cert in certifications:
            Certification.objects.update_or_create(
                user=user,
                name=cert["name"],
                issuer=cert["issuer"],
                defaults=cert,
            )

        now = timezone.now()
        blogs = [
            {
                "title": "Designing Scalable React Codebases",
                "excerpt": "Patterns for structuring React apps that stay maintainable as teams and features grow.",
                "content": (
                    "This deep-dive covers folder strategy, state ownership, rendering boundaries, "
                    "and practical architecture decisions for scale."
                ),
                "tags": ["React", "Architecture", "Frontend"],
                "read_time": "9 min read",
                "is_published": True,
                "is_featured": True,
                "published_at": now - timedelta(days=35),
            },
            {
                "title": "Django API Performance Playbook",
                "excerpt": "A practical guide to profiling and improving API response times in DRF.",
                "content": (
                    "Learn where latency hides in ORM queries, serializer layers, and infrastructure, "
                    "plus how to improve response times with low-risk changes."
                ),
                "tags": ["Django", "DRF", "Performance"],
                "read_time": "7 min read",
                "is_published": True,
                "is_featured": True,
                "published_at": now - timedelta(days=64),
            },
            {
                "title": "Building Reliable CI/CD Pipelines for Small Teams",
                "excerpt": "How to ship faster without sacrificing quality with pragmatic pipeline stages.",
                "content": (
                    "Focus on essential pipeline gates, branching hygiene, environment parity, and "
                    "release confidence metrics that matter."
                ),
                "tags": ["CI/CD", "DevOps", "GitHub Actions"],
                "read_time": "6 min read",
                "is_published": True,
                "is_featured": False,
                "published_at": now - timedelta(days=93),
            },
            {
                "title": "Effective Product Discovery for Engineers",
                "excerpt": "Frameworks engineers can use to turn vague problems into clear product bets.",
                "content": (
                    "A practical walkthrough of user problem framing, metrics selection, and rapid "
                    "experimentation loops."
                ),
                "tags": ["Product", "Strategy", "Engineering"],
                "read_time": "5 min read",
                "is_published": True,
                "is_featured": False,
                "published_at": now - timedelta(days=121),
            },
            {
                "title": "Notes from Shipping Multi-Section Portfolio Platforms",
                "excerpt": "Implementation lessons from building customizable, content-driven portfolio products.",
                "content": (
                    "Covers information architecture, section visibility controls, editable schemas, "
                    "and UI consistency in admin dashboards."
                ),
                "tags": ["Django", "React", "UX"],
                "read_time": "8 min read",
                "is_published": True,
                "is_featured": False,
                "published_at": now - timedelta(days=150),
            },
        ]

        for blog in blogs:
            BlogPost.objects.update_or_create(
                user=user,
                title=blog["title"],
                defaults=blog,
            )

        testimonials = [
            {
                "client_name": "Sarah Johnson",
                "client_role": "Product Manager",
                "client_company": "Tech Innovations Inc.",
                "content": (
                    "Sait consistently delivered clear architecture and clean implementations. "
                    "Feature delivery speed improved without quality tradeoffs."
                ),
                "rating": 5,
                "project_name": "Orbit Commerce Suite",
                "is_featured": True,
                "order": 1,
            },
            {
                "client_name": "Michael Chen",
                "client_role": "CTO",
                "client_company": "StartupXYZ",
                "content": (
                    "He shipped our MVP with excellent code quality and smart scope management. "
                    "The product was stable from day one of launch."
                ),
                "rating": 5,
                "project_name": "Pulse Hiring Dashboard",
                "is_featured": True,
                "order": 2,
            },
            {
                "client_name": "Emily Rodriguez",
                "client_role": "Design Lead",
                "client_company": "Digital Agency Co.",
                "content": (
                    "Great collaboration with design and QA. UI fidelity was excellent and edge cases "
                    "were handled thoughtfully."
                ),
                "rating": 5,
                "project_name": "Realtime Collab Whiteboard",
                "is_featured": True,
                "order": 3,
            },
            {
                "client_name": "Arjun Mehta",
                "client_role": "Engineering Manager",
                "client_company": "CivicBridge",
                "content": (
                    "Delivered impactful volunteer engineering outcomes quickly. Their planning and "
                    "communication kept stakeholders aligned."
                ),
                "rating": 5,
                "project_name": "NGO Digital Enablement Program",
                "is_featured": False,
                "order": 4,
            },
            {
                "client_name": "Nora Patel",
                "client_role": "Head of Platform",
                "client_company": "CloudScale Labs",
                "content": (
                    "Strong systems thinking and practical execution. Sait made complex backend topics "
                    "easy for cross-functional teams to understand."
                ),
                "rating": 5,
                "project_name": "API Performance Observatory",
                "is_featured": False,
                "order": 5,
            },
        ]

        for testimonial in testimonials:
            Testimonial.objects.update_or_create(
                user=user,
                client_name=testimonial["client_name"],
                client_company=testimonial["client_company"],
                defaults=testimonial,
            )

        summary = {
            "categories": SkillCategory.objects.filter(user=user).count(),
            "skills": Skill.objects.filter(user=user).count(),
            "projects": Project.objects.filter(user=user).count(),
            "experience": Experience.objects.filter(user=user).count(),
            "education": Education.objects.filter(user=user).count(),
            "activities": Activity.objects.filter(user=user).count(),
            "achievements": Achievement.objects.filter(user=user).count(),
            "certifications": Certification.objects.filter(user=user).count(),
            "blog_posts": BlogPost.objects.filter(user=user).count(),
            "testimonials": Testimonial.objects.filter(user=user).count(),
        }

        self.stdout.write(self.style.SUCCESS("Successfully seeded portfolio data for sait27"))
        self.stdout.write(f"Counts: {summary}")
