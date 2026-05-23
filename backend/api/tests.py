from django.test import TestCase

from .resume_autofill import (
    _build_text_quality_report,
    _build_section_report,
    _derive_projects_from_experience,
    _extract_contact,
    _guess_name_and_tagline,
    _extract_languages,
    _normalize_extracted_resume_text,
    _parse_certifications,
    _parse_experience,
    _split_inline_summary,
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

    def test_contact_extraction_parses_phone_plain_links_and_website(self):
        raw_text = """
JOHN DOE
Full Stack Developer
Phone: +1 (415) 555-1212
Email: john dot doe [at] example dot com
Website: john-doe.dev
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe
""".strip()

        contact = _extract_contact(raw_text)

        self.assertEqual(contact.get('email'), 'john.doe@example.com')
        self.assertEqual(contact.get('phone'), '+14155551212')
        self.assertEqual(contact.get('website_url'), 'https://john-doe.dev')
        self.assertEqual(contact.get('linkedin_url'), 'https://linkedin.com/in/johndoe')
        self.assertEqual(contact.get('github_url'), 'https://github.com/johndoe')

    def test_name_and_tagline_guess_uses_contact_header_when_general_section_is_empty(self):
        name, tagline = _guess_name_and_tagline(
            '',
            contact_text="""
JOHN DOE
Full Stack Developer
john.doe@example.com
john-doe.dev
""".strip(),
        )

        self.assertEqual(name, 'John Doe')
        self.assertEqual(tagline, 'Full Stack Developer')

    def test_name_and_tagline_guess_from_single_line_header(self):
        name, tagline = _guess_name_and_tagline(
            '',
            contact_text="""
JOHN DOE | Full Stack Developer | john.doe@example.com | linkedin.com/in/johndoe
""".strip(),
        )

        self.assertEqual(name, 'John Doe')
        self.assertEqual(tagline, 'Full Stack Developer')

    def test_inline_summary_header_parses_personal_details_cleanly(self):
        header = (
            'Saiteja Nalam - Frontend Developer Rajahmundry, East Godavari - Andhra Pradesh 534341. '
            '+91 7981667591 - Saitejanalam24@gmail.com Summary : Frontend Developer with 3.5+ years of experience'
        )

        header_text, inline_summary = _split_inline_summary(header)
        contact = _extract_contact(header_text)
        name, tagline = _guess_name_and_tagline(header_text)

        self.assertEqual(name, 'Saiteja Nalam')
        self.assertEqual(tagline, 'Frontend Developer')
        self.assertEqual(contact.get('email'), 'Saitejanalam24@gmail.com')
        self.assertEqual(contact.get('phone'), '+917981667591')
        self.assertFalse(contact.get('website_url'))
        self.assertTrue(inline_summary.startswith('Frontend Developer with 3.5+ years'))

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

    def test_skill_highlights_heading_maps_into_skills_section(self):
        text = """
EDUCATION
B.Tech, Computer Science

Skill Highlights:
React, Node.js, AWS
""".strip()

        sections, _ = _split_sections(text)

        self.assertIn('skills', sections)
        self.assertIn('React', sections['skills'])

    def test_compact_resume_experience_projects_and_certifications_parse_cleanly(self):
        experience_text = """
Covantech Pvt Ltd Jan 2025 - Present Web Application: ● Developed a secure document management system using React, TypeScript, and Redux. ● Built a complete registration flow with AWS Cognito, Stripe, and Two-Factor Authentication (2FA). Deepgrid DataCenter Pvt Ltd | Frontend and React Native Developer Aug 2023 - Dec 2024 Web Application: ● Developed a user-friendly form builder interface using React.js, Node.js, and TypeScript. ● Built a reporting platform within the website, allowing users to export data and generate PDF reports. Mobile Application: ● Redesigned the iOS/Android app to align with current design standards. ● Added offline functionality using MongoDB Realm. Icompaas | Frontend Developer Sept 2021 - July 2023 ● Developed a data visualisation application using React.js and AmCharts5. Icompaas | Jr. Front End Developer - Intern Jun 2021 - August 2021 ● Created and executed test cases in Postman Runner.
""".strip()
        certifications_text = "● Salesforce Administrator."

        experience = _parse_experience(experience_text, fallback_role='Frontend Developer')
        projects = _derive_projects_from_experience(experience_text, experience)
        certifications = _parse_certifications(certifications_text)

        self.assertEqual(len(experience), 4)
        self.assertEqual(experience[0]['company'], 'Covantech Pvt Ltd')
        self.assertEqual(experience[0]['role'], 'Frontend Developer')
        self.assertEqual(experience[1]['company'], 'Deepgrid DataCenter Pvt Ltd')
        self.assertEqual(experience[1]['role'], 'Frontend and React Native Developer')
        self.assertEqual(experience[2]['company'], 'Icompaas')
        self.assertEqual(experience[2]['role'], 'Frontend Developer')
        self.assertEqual(experience[3]['company'], 'Icompaas')
        self.assertEqual(experience[3]['role'], 'Jr. Front End Developer - Intern')
        self.assertGreaterEqual(len(projects), 3)
        self.assertEqual(projects[0]['title'], 'Covantech Pvt Ltd Web App')
        self.assertEqual(projects[1]['title'], 'Deepgrid DataCenter Pvt Ltd Web App')
        self.assertEqual(projects[2]['title'], 'Deepgrid DataCenter Pvt Ltd Mobile App')
        self.assertEqual(certifications[0]['name'], 'Salesforce Administrator')

    def test_normalized_resume_text_preserves_headings_and_bullets(self):
        raw_text = (
            'JOHN DOE Summary: Frontend Developer with 5 years of experience '
            'Skills: React, TypeScript, CSS Projects: • Portfolio Builder • Design System'
        )

        normalized = _normalize_extracted_resume_text(raw_text)

        self.assertIn('Summary:', normalized)
        self.assertIn('Skills:', normalized)
        self.assertIn('Projects:', normalized)
        self.assertIn('\n• Portfolio Builder', normalized)

    def test_quality_report_flags_flattened_resume_text_as_unsafe_to_save(self):
        flattened_text = (
            'John Doe Frontend Developer john@example.com +91 9000000000 '
            'Worked on React TypeScript CSS HTML JavaScript APIs databases Docker Kubernetes AWS '
            'Jan 2021 - Feb 2024 Jan 2020 - Dec 2020 Jan 2019 - Dec 2019'
        )

        report = _build_text_quality_report(flattened_text, 'pypdf')

        self.assertFalse(report['save_recommended'])
        self.assertIn(report['quality_label'], {'low', 'unsupported'})

    def test_quality_report_accepts_structured_resume_text(self):
        structured_text = """
JOHN DOE
Frontend Developer
john@example.com
+91 9000000000

SUMMARY
Frontend developer focused on responsive products.

SKILLS
React
TypeScript
CSS

EXPERIENCE
Frontend Developer | Acme Labs
Jan 2021 - Present
- Built design systems

PROJECTS
Portfolio Platform
- Built a portfolio CMS
https://github.com/example/portfolio
""".strip()

        report = _build_text_quality_report(structured_text, 'pymupdf')

        self.assertTrue(report['supported_resume'])
        self.assertGreaterEqual(report['quality_score'], 58)
