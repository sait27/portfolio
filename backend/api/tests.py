from django.test import TestCase

from .resume_autofill import (
    _build_section_report,
    _extract_contact,
    _extract_languages,
    _parse_activities,
    _parse_projects,
    _extract_skills,
    _split_sections,
)


class ResumeAutofillParserTests(TestCase):
    def test_split_sections_detects_supported_and_unknown_headings(self):
        text = """
JOHN DOE

SKILLS
Python, Django

PROJECTS
Portfolio Platform

PATENTS
Realtime Parsing Framework

ACKNOWLEDGEMENT
Thanks to mentors
""".strip()

        sections, unknown_headings = _split_sections(text)

        self.assertIn('skills', sections)
        self.assertIn('projects', sections)
        self.assertIn('acknowledgements', sections)
        self.assertIn('Patents', unknown_headings)

    def test_project_and_activity_parsers_extract_core_fields(self):
        project_section = """
Portfolio Platform 2024
- Built full-stack portfolio manager
https://github.com/example/portfolio
https://portfolio.example.com
""".strip()
        activity_section = """
Volunteer Lead at Local Coding Club Jan 2022 - Present
- Organized weekly coding sessions
""".strip()

        projects = _parse_projects(project_section)
        activities = _parse_activities(activity_section)

        self.assertEqual(len(projects), 1)
        self.assertEqual(projects[0]['title'], 'Portfolio Platform')
        self.assertIn('github.com', projects[0]['repo_url'])
        self.assertEqual(len(activities), 1)
        self.assertEqual(activities[0]['organization'], 'Local Coding Club')
        self.assertTrue(activities[0]['is_current'])

    def test_section_report_marks_missing_and_neglected_sections(self):
        sections = {
            'general': 'JOHN DOE',
            'skills': 'Python, Django',
            'acknowledgements': 'Thanks to mentors',
        }
        report = _build_section_report(
            sections=sections,
            full_name='John Doe',
            tagline='Backend Developer',
            contact={'email': 'john@example.com'},
            skills=['Python'],
            languages=[],
            projects=[],
            experience=[],
            education=[],
            activities=[],
            certifications=[],
            achievements=[],
            unknown_headings=['Patents'],
        )

        self.assertIn('Personal Details', report['found'])
        self.assertIn('Projects', report['missing'])
        self.assertIn('Acknowledgements', report['neglected'])
        self.assertIn('Patents', report['neglected'])

    def test_contact_extraction_parses_phone_and_plain_links(self):
        raw_text = """
Name: John Doe
Phone: +1 (415) 555-1212
Email: john.doe@example.com
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe
""".strip()

        contact = _extract_contact(raw_text)

        self.assertEqual(contact.get('email'), 'john.doe@example.com')
        self.assertEqual(contact.get('phone'), '+14155551212')
        self.assertEqual(contact.get('linkedin_url'), 'https://linkedin.com/in/johndoe')
        self.assertEqual(contact.get('github_url'), 'https://github.com/johndoe')

    def test_languages_are_separate_from_skills(self):
        text = """
SKILLS
Django, React, PostgreSQL

LANGUAGES
English, Hindi
""".strip()

        sections, _ = _split_sections(text)
        languages = _extract_languages(sections)
        skills = _extract_skills(text, sections)

        self.assertIn('English', languages)
        self.assertIn('Hindi', languages)
        self.assertNotIn('English', skills)
        self.assertNotIn('Hindi', skills)
