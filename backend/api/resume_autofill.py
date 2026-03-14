from __future__ import annotations

import datetime as dt
import io
import re
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse

import requests
from django.db.models import Max

from .models import (
    Achievement,
    Activity,
    Certification,
    Education,
    Experience,
    Profile,
    Project,
    Skill,
    SkillCategory,
)

MONTH_MAP = {
    'jan': 1,
    'january': 1,
    'feb': 2,
    'february': 2,
    'mar': 3,
    'march': 3,
    'apr': 4,
    'april': 4,
    'may': 5,
    'jun': 6,
    'june': 6,
    'jul': 7,
    'july': 7,
    'aug': 8,
    'august': 8,
    'sep': 9,
    'sept': 9,
    'september': 9,
    'oct': 10,
    'october': 10,
    'nov': 11,
    'november': 11,
    'dec': 12,
    'december': 12,
}

HEADING_ALIASES = {
    'contact': 'contact',
    'contact information': 'contact',
    'personal details': 'contact',
    'personal information': 'contact',
    'personal profile': 'contact',
    'basic details': 'contact',
    'summary': 'summary',
    'professional summary': 'summary',
    'profile summary': 'summary',
    'professional profile': 'summary',
    'career summary': 'summary',
    'objective': 'summary',
    'career objective': 'summary',
    'profile': 'summary',
    'about': 'summary',
    'skills': 'skills',
    'skillset': 'skills',
    'technical skills': 'skills',
    'technical proficiencies': 'skills',
    'technical expertise': 'skills',
    'key skills': 'skills',
    'areas of expertise': 'skills',
    'core skills': 'skills',
    'core competencies': 'skills',
    'competencies': 'skills',
    'tools': 'skills',
    'frameworks': 'skills',
    'technologies': 'skills',
    'tech stack': 'skills',
    'tech skills': 'skills',
    'technical toolkit': 'skills',
    'programming languages': 'skills',
    'languages': 'languages',
    'spoken languages': 'languages',
    'language proficiency': 'languages',
    'language proficiencies': 'languages',
    'known languages': 'languages',
    'professional skills': 'skills',
    'projects': 'projects',
    'project': 'projects',
    'academic projects': 'projects',
    'personal projects': 'projects',
    'project experience': 'projects',
    'selected projects': 'projects',
    'key projects': 'projects',
    'internships': 'experience',
    'internship experience': 'experience',
    'personal skills': 'soft_skills',
    'soft skills': 'soft_skills',
    'work history': 'experience',
    'work experience': 'experience',
    'career history': 'experience',
    'employment history': 'experience',
    'professional experience': 'experience',
    'experience': 'experience',
    'employment': 'experience',
    'academic background': 'education',
    'academic qualifications': 'education',
    'education': 'education',
    'education and training': 'education',
    'activities': 'activities',
    'extra curricular activities': 'activities',
    'extracurricular activities': 'activities',
    'co curricular activities': 'activities',
    'co-curricular activities': 'activities',
    'volunteer work': 'activities',
    'volunteer experience': 'activities',
    'leadership': 'activities',
    'positions of responsibility': 'activities',
    'community involvement': 'activities',
    'clubs and societies': 'activities',
    'licenses and certifications': 'certifications',
    'certification': 'certifications',
    'certifications': 'certifications',
    'professional certifications': 'certifications',
    'licenses': 'certifications',
    'licenses and certificates': 'certifications',
    'licenses': 'certifications',
    'honors': 'achievements',
    'honours': 'achievements',
    'accomplishments': 'achievements',
    'achievements': 'achievements',
    'awards': 'achievements',
    'declaration': 'declaration',
    'references': 'references',
    'hobbies': 'hobbies',
    'interests': 'interests',
    'publications': 'publications',
    'acknowledgement': 'acknowledgements',
    'acknowledgements': 'acknowledgements',
    'acknowledgment': 'acknowledgements',
    'acknowledgments': 'acknowledgements',
}

SECTION_DISPLAY_NAMES = {
    'personal_details': 'Personal Details',
    'summary': 'Summary',
    'skills': 'Skills',
    'languages': 'Languages',
    'projects': 'Projects',
    'experience': 'Experience',
    'education': 'Education',
    'activities': 'Activities',
    'certifications': 'Certifications',
    'achievements': 'Achievements',
}

WEBSITE_SECTION_KEYS = tuple(SECTION_DISPLAY_NAMES.keys())
UNSUPPORTED_RESUME_SECTION_KEYS = {
    'declaration',
    'references',
    'hobbies',
    'interests',
    'publications',
    'acknowledgements',
}

KNOWN_SKILLS = [
    'Python',
    'Django',
    'Flask',
    'FastAPI',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Express',
    'SQL',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'AWS',
    'GCP',
    'Azure',
    'Docker',
    'Kubernetes',
    'Git',
    'GitHub',
    'Linux',
    'HTML',
    'CSS',
    'Tailwind CSS',
    'REST API',
    'GraphQL',
    'CI/CD',
    'Jenkins',
    'Terraform',
    'Pandas',
    'NumPy',
    'PyTorch',
    'TensorFlow',
    'OpenCV',
    'C',
    'C++',
    'Java',
    'Spring Boot',
    'Go',
    'Rust',
    'PHP',
    'Laravel',
]

KNOWN_HUMAN_LANGUAGES = {
    'english',
    'hindi',
    'telugu',
    'tamil',
    'kannada',
    'malayalam',
    'marathi',
    'bengali',
    'gujarati',
    'punjabi',
    'urdu',
    'spanish',
    'french',
    'german',
    'italian',
    'portuguese',
    'arabic',
    'chinese',
    'mandarin',
    'japanese',
    'korean',
    'russian',
}

EMAIL_RE = re.compile(r'[\w.\-+]+@[\w.\-]+\.\w+')
URL_RE = re.compile(r'https?://[^\s)]+')
PLAIN_URL_RE = re.compile(
    r'\b(?:www\.)?(linkedin\.com/[^\s,;|)]+|github\.com/[^\s,;|)]+|x\.com/[^\s,;|)]+|twitter\.com/[^\s,;|)]+)\b',
    re.IGNORECASE,
)
PHONE_RE = re.compile(
    r'(?<!\d)(?:\+?\d{1,3}[\s\-().]*)?(?:\d[\s\-().]*){9,14}\d(?!\d)'
)
MONTH_NAME_RE = (
    r'(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|'
    r'aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?'
)
DATE_TOKEN_RE = rf'(?:{MONTH_NAME_RE}\s+\d{{4}}|\d{{1,2}}[/-]\d{{4}}|\d{{4}})'
DATE_RANGE_RE = re.compile(
    rf'(?P<start>{DATE_TOKEN_RE})\s*(?:-|–|—|−|to|until|through|thru)\s*'
    rf'(?P<end>(?:Present|Current|Now|{DATE_TOKEN_RE}))',
    re.IGNORECASE,
)
DATE_SINGLE_RE = re.compile(rf'(?P<date>{DATE_TOKEN_RE})', re.IGNORECASE)
_CLOUDINARY_VERSION_RE = re.compile(r'^v\d+$')
ROLE_HINT_RE = re.compile(
    r'\b(engineer|developer|manager|lead|intern|analyst|consultant|architect|designer|specialist|director|officer|scientist|founder|co-founder|associate)\b',
    re.IGNORECASE,
)
COMPANY_HINT_RE = re.compile(
    r'\b(inc|llc|ltd|corp|corporation|technologies|technology|systems|solutions|labs|group|studio|university|college|bank|consulting)\b',
    re.IGNORECASE,
)
EDUCATION_HINT_RE = re.compile(
    r'\b(bachelor|master|phd|b\.?s|m\.?s|university|college|school|institute|gpa|cgpa|class x|class xii|bie|bse|marks)\b',
    re.IGNORECASE,
)
SKILL_LABELS = {
    'programming languages',
    'frameworks',
    'libraries',
    'tools',
    'platforms',
    'databases',
    'cloud',
    'devops',
    'technologies',
    'skills',
    'competencies',
    'proficiencies',
}
AMBIGUOUS_SKILLS = {'go', 'c'}
SKILL_NOISE_TOKENS = {
    'projects',
    'project',
    'advanced',
    'basic',
    'professional',
    'technology',
    'technologies',
    'skills',
    'personal skills',
}
HEADING_KEYWORD_HINTS = {
    'summary',
    'objective',
    'profile',
    'about',
    'contact',
    'personal',
    'skills',
    'projects',
    'experience',
    'education',
    'activities',
    'volunteer',
    'leadership',
    'achievements',
    'awards',
    'certification',
    'certifications',
    'publication',
    'references',
    'hobbies',
    'interests',
    'acknowledg',
    'declaration',
}


def _clean_line(line: str) -> str:
    return re.sub(r'\s+', ' ', line.replace('\u2022', ' ').strip())


def _normalize_heading(line: str) -> str:
    normalized = re.sub(r'[^A-Za-z0-9/&+\-\s]', ' ', line).lower()
    normalized = normalized.replace('&', ' and ')
    normalized = normalized.replace('+', ' ')
    normalized = re.sub(r'\s+', ' ', normalized).strip(' :|-')
    return normalized


def _heading_candidate(line: str) -> str | None:
    stripped = line.strip()
    if not stripped:
        return None
    if stripped.startswith(('-', '*')):
        return None
    if '@' in stripped or 'http://' in stripped or 'https://' in stripped:
        return None
    if ':' in stripped and not stripped.endswith(':'):
        return None
    normalized = _normalize_heading(stripped)
    if not normalized:
        return None
    words = normalized.split()
    if len(words) > 6:
        return None
    return normalized


def _looks_like_heading_label(line: str, *, prev_blank: bool, next_blank: bool) -> str | None:
    normalized = _heading_candidate(line)
    if not normalized:
        return None

    stripped = line.strip()
    words = normalized.split()
    if any(char.isdigit() for char in stripped):
        return None

    is_upper = stripped.isupper()
    has_colon = stripped.endswith(':')
    is_title = stripped == stripped.title()
    if is_title and not any(keyword in normalized for keyword in HEADING_KEYWORD_HINTS):
        return None

    if not (has_colon or is_upper or is_title):
        return None
    if not (prev_blank or next_blank or len(words) <= 2):
        return None
    return normalized


def _resolve_heading_section(line: str) -> str | None:
    normalized = _heading_candidate(line)
    if not normalized:
        return None

    words = normalized.split()
    if len(words) > 6:
        return None

    direct = HEADING_ALIASES.get(normalized)
    if direct:
        return direct

    if len(words) > 4:
        return None

    for heading, section in HEADING_ALIASES.items():
        if normalized.startswith(f'{heading} ') or normalized.endswith(f' {heading}'):
            return section
    return None


def _normalize_skill(token: str) -> str:
    token = token.strip(' -|,;:()[]{}.')
    if not token:
        return ''
    if len(token) > 32:
        return ''

    token_lower = token.lower()
    if token_lower in SKILL_NOISE_TOKENS:
        return ''
    if any(stop in token_lower for stop in {'responsible for', 'experienced in', 'experience in', 'worked on'}):
        return ''
    if re.search(r'[.!?]', token):
        return ''
    if re.search(r'\d{2,}', token):
        return ''

    upper = token.upper()
    acronym_map = {
        'AWS': 'AWS',
        'GCP': 'GCP',
        'CI/CD': 'CI/CD',
        'SQL': 'SQL',
        'HTML': 'HTML',
        'CSS': 'CSS',
        'API': 'API',
    }
    if upper in acronym_map:
        return acronym_map[upper]
    parts = token.split()
    if len(parts) > 3:
        return ''
    return ' '.join(part.capitalize() if part.islower() else part for part in parts)


def _parse_date_token(value: str) -> dt.date | None:
    value = (value or '').strip()
    value = value.replace(',', ' ').replace('.', '').replace('–', '-').replace('—', '-')
    value = re.sub(r'\s+', ' ', value).strip()
    if not value:
        return None
    value_lower = value.lower()
    if value_lower in {'present', 'current', 'now'}:
        return None

    full_month = re.match(rf'^({MONTH_NAME_RE})\s+(\d{{4}})$', value, flags=re.IGNORECASE)
    if full_month:
        month_raw, year_raw = full_month.groups()
        month = MONTH_MAP.get(month_raw.lower())
        if month:
            return dt.date(int(year_raw), month, 1)

    month_year = re.match(r'^(\d{1,2})[/-](\d{4})$', value)
    if month_year:
        month, year = month_year.groups()
        month_int = min(max(int(month), 1), 12)
        return dt.date(int(year), month_int, 1)

    if re.match(r'^\d{4}$', value):
        return dt.date(int(value), 1, 1)
    return None


def _extract_pdf_text(data: bytes) -> str:
    reader = None
    try:
        from pypdf import PdfReader  # type: ignore

        reader = PdfReader(io.BytesIO(data))
    except Exception:
        try:
            from PyPDF2 import PdfReader  # type: ignore

            reader = PdfReader(io.BytesIO(data))
        except Exception as exc:
            raise RuntimeError(
                'Unable to parse resume PDF. Install "pypdf" (recommended) or "PyPDF2".'
            ) from exc

    parts: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text() or ''
        if page_text.strip():
            parts.append(page_text)
    return '\n'.join(parts).strip()


def _extract_cloudinary_asset_details(asset_url: str) -> dict[str, str] | None:
    parsed = urlparse(asset_url)
    if not parsed.netloc.endswith('cloudinary.com'):
        return None

    path_parts = [part for part in parsed.path.split('/') if part]
    if len(path_parts) < 4:
        return None

    resource_type = path_parts[1]
    delivery_type = path_parts[2]

    version_index = next(
        (index for index, part in enumerate(path_parts) if _CLOUDINARY_VERSION_RE.match(part)),
        None,
    )
    if version_index is None:
        public_id_parts = path_parts[3:]
    else:
        if version_index >= len(path_parts) - 1:
            return None
        public_id_parts = path_parts[version_index + 1 :]

    if not public_id_parts:
        return None

    file_name = public_id_parts[-1]
    if '.' in file_name:
        base_name, extension = file_name.rsplit('.', 1)
    else:
        base_name, extension = file_name, ''

    # Non-raw Cloudinary assets should drop extension from public_id.
    if resource_type != 'raw' and base_name:
        public_id_parts[-1] = base_name

    public_id = '/'.join(public_id_parts).strip('/')
    if not public_id:
        return None

    return {
        'public_id': public_id,
        'resource_type': resource_type,
        'delivery_type': delivery_type,
        'format': extension.lower(),
    }


def _build_cloudinary_signed_download_url(asset_url: str) -> str | None:
    asset = _extract_cloudinary_asset_details(asset_url)
    if not asset:
        return None

    try:
        import cloudinary
        import cloudinary.utils

        config = cloudinary.config()
        if not config.api_key or not config.api_secret:
            return None

        return cloudinary.utils.private_download_url(
            asset['public_id'],
            asset['format'] or 'pdf',
            resource_type=asset['resource_type'],
            type=asset['delivery_type'],
            attachment=False,
            secure=True,
            expires_at=int(time.time()) + (10 * 60),
        )
    except Exception:
        return None


def _download_resume_bytes(resume_url: str) -> bytes:
    response = None
    primary_error = None
    try:
        response = requests.get(resume_url, timeout=25)
        response.raise_for_status()
        if response.content[:4] == b'%PDF':
            return response.content
    except requests.RequestException as exc:
        primary_error = exc

    fallback_url = _build_cloudinary_signed_download_url(resume_url)
    if not fallback_url or fallback_url == resume_url:
        if primary_error:
            raise primary_error
        if response is not None:
            return response.content
        raise requests.RequestException('Unable to fetch resume URL.')

    fallback_response = requests.get(fallback_url, timeout=25)
    fallback_response.raise_for_status()
    return fallback_response.content


def _split_sections(text: str) -> tuple[dict[str, str], list[str]]:
    sections: dict[str, list[str]] = {'general': []}
    neglected_headings: list[str] = []
    seen_neglected: set[str] = set()
    lines = text.splitlines()
    current = 'general'
    for idx, raw_line in enumerate(lines):
        line = raw_line.strip()
        prev_blank = idx == 0 or not lines[idx - 1].strip()
        next_blank = idx == len(lines) - 1 or not lines[idx + 1].strip()
        if not line:
            sections.setdefault(current, []).append('')
            continue
        section = _resolve_heading_section(line)
        if section:
            current = section
            sections.setdefault(current, [])
            continue
        heading_candidate = _looks_like_heading_label(
            line,
            prev_blank=prev_blank,
            next_blank=next_blank,
        )
        if heading_candidate and heading_candidate not in HEADING_ALIASES:
            current = f'unknown:{heading_candidate}'
            sections.setdefault(current, [])
            label = heading_candidate.title()
            if heading_candidate not in seen_neglected:
                seen_neglected.add(heading_candidate)
                neglected_headings.append(label)
            continue
        sections.setdefault(current, []).append(raw_line)
    normalized_sections = {key: '\n'.join(value).strip() for key, value in sections.items()}
    return normalized_sections, neglected_headings


def _normalize_web_url(value: str) -> str:
    cleaned = (value or '').strip().strip('.,;)')
    if not cleaned:
        return ''
    if not re.match(r'^https?://', cleaned, flags=re.IGNORECASE):
        cleaned = f'https://{cleaned}'
    return cleaned


def _normalize_phone(value: str) -> str:
    cleaned = re.sub(r'\s+', ' ', (value or '').strip())
    cleaned = cleaned.strip('.,;')
    if not cleaned:
        return ''
    digits = re.sub(r'\D', '', cleaned)
    if len(digits) < 10 or len(digits) > 15:
        return ''
    if cleaned.startswith('+'):
        return f"+{re.sub(r'[^0-9]', '', cleaned[1:])}"
    return digits


def _extract_contact(general_text: str) -> dict[str, str]:
    contact: dict[str, str] = {}
    normalized_text = general_text.replace('(at)', '@').replace('[at]', '@').replace(' at ', '@')
    normalized_text = normalized_text.replace('(dot)', '.').replace('[dot]', '.').replace(' dot ', '.')

    labeled_email = re.search(r'\bemail\s*[:\-]\s*(?P<value>[^\s,;|]+@[^\s,;|]+)', normalized_text, flags=re.IGNORECASE)
    email_match = labeled_email or EMAIL_RE.search(normalized_text)
    if email_match:
        value = email_match.group('value') if 'value' in email_match.groupdict() else email_match.group(0)
        contact['email'] = value.strip().strip('.,;')

    labeled_phone = re.search(
        r'\b(?:phone|mobile|contact|tel|telephone)\s*[:\-]\s*(?P<value>[+()\d][\d\s\-().]{7,})',
        normalized_text,
        flags=re.IGNORECASE,
    )
    phone_source = labeled_phone.group('value') if labeled_phone else ''
    if not phone_source:
        phone_match = PHONE_RE.search(normalized_text)
        if phone_match:
            phone_source = phone_match.group(0)
    phone_value = _normalize_phone(phone_source)
    if phone_value:
        contact['phone'] = phone_value

    all_urls = []
    all_urls.extend(URL_RE.findall(normalized_text))
    all_urls.extend(PLAIN_URL_RE.findall(normalized_text))
    for raw_url in all_urls:
        url = _normalize_web_url(raw_url)
        if not url:
            continue
        lowered = url.lower()
        if 'linkedin.com' in lowered and not contact.get('linkedin_url'):
            contact['linkedin_url'] = url
        elif 'github.com' in lowered and not contact.get('github_url'):
            contact['github_url'] = url
        elif ('twitter.com' in lowered or 'x.com' in lowered) and not contact.get('twitter_url'):
            contact['twitter_url'] = url
    return contact


def _guess_name_and_tagline(general_text: str, contact_text: str = '') -> tuple[str, str]:
    combined_text = f'{contact_text}\n{general_text}'.strip()
    labeled_name_match = re.search(
        r'\b(?:name|full name)\s*[:\-]\s*(?P<value>[A-Za-z][A-Za-z.\s]{1,80})',
        combined_text,
        flags=re.IGNORECASE,
    )
    if labeled_name_match:
        name_value = _clean_line(labeled_name_match.group('value'))
        if 2 <= len(name_value.split()) <= 5 and not re.search(r'\d', name_value):
            return name_value[:100], ''

    lines = [_clean_line(line) for line in general_text.splitlines() if _clean_line(line)]
    if not lines:
        return '', ''

    name = ''
    tagline = ''
    for idx, line in enumerate(lines[:10]):
        line_lower = line.lower()
        if '@' in line or 'http://' in line or 'https://' in line:
            continue
        if any(keyword in line_lower for keyword in ('email', 'phone', 'mobile', 'linkedin', 'github', 'twitter', 'x.com')):
            continue
        if _resolve_heading_section(line):
            continue
        if 2 <= len(line.split()) <= 6 and len(line) <= 70 and not re.search(r'\d', line):
            name = line
            if idx + 1 < len(lines):
                next_line = lines[idx + 1]
                next_lower = next_line.lower()
                if (
                    '@' not in next_line
                    and 'http' not in next_line
                    and len(next_line) <= 90
                    and not any(keyword in next_lower for keyword in ('email', 'phone', 'mobile', 'linkedin', 'github', 'twitter', 'x.com'))
                    and not _resolve_heading_section(next_line)
                ):
                    tagline = next_line
            break
    return name, tagline


def _extract_skills(full_text: str, sections: dict[str, str]) -> list[str]:
    candidates: list[str] = []
    skill_text = sections.get('skills', '').strip()
    for chunk in re.split(r'[\n,|;/]+', skill_text):
        piece = _clean_line(chunk)
        if ':' in piece:
            left, right = piece.split(':', 1)
            if left.strip().lower() in SKILL_LABELS:
                piece = right
        for sub_chunk in re.split(r'\band\b', piece, flags=re.IGNORECASE):
            token = _normalize_skill(sub_chunk)
            if token:
                candidates.append(token)

    searchable_text = f' {full_text} '
    for skill in KNOWN_SKILLS:
        skill_key = skill.lower()
        if skill_key in AMBIGUOUS_SKILLS:
            continue
        pattern = re.escape(skill).replace(r'\ ', r'\s+')
        if re.search(rf'(?<!\w){pattern}(?!\w)', searchable_text, flags=re.IGNORECASE):
            candidates.append(skill)

    deduped: list[str] = []
    seen = set()
    for skill in candidates:
        key = skill.lower()
        if key in KNOWN_HUMAN_LANGUAGES:
            continue
        if key in seen:
            continue
        seen.add(key)
        deduped.append(skill)
    return deduped[:80]


def _extract_languages(sections: dict[str, str]) -> list[str]:
    candidates: list[str] = []
    language_text = sections.get('languages', '').strip()
    if not language_text:
        return []

    for chunk in re.split(r'[\n,|;/]+', language_text):
        piece = _clean_line(chunk)
        if ':' in piece:
            left, right = piece.split(':', 1)
            if left.strip().lower() in {'languages', 'spoken languages', 'language proficiency', 'known languages'}:
                piece = right
        token = piece.strip(' -|,;:()[]{}.')
        token = re.sub(r'\((?:native|fluent|professional|basic|intermediate|advanced)[^)]+\)', '', token, flags=re.IGNORECASE)
        token = re.sub(r'\b(native|fluent|professional|basic|intermediate|advanced)\b', '', token, flags=re.IGNORECASE)
        token = re.sub(r'\s+', ' ', token).strip(' -|,;:.')
        if not token:
            continue
        if any(char.isdigit() for char in token):
            continue
        if len(token) > 40:
            continue
        if len(token.split()) > 3:
            continue
        candidates.append(token.title())

    deduped: list[str] = []
    seen: set[str] = set()
    for language in candidates:
        key = language.lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(language)
    return deduped[:30]


def _looks_like_company(value: str) -> bool:
    if not value:
        return False
    return bool(COMPANY_HINT_RE.search(value))


def _looks_like_role(value: str) -> bool:
    if not value:
        return False
    return bool(ROLE_HINT_RE.search(value))


def _extract_role_company(header: str) -> tuple[str, str]:
    header = header.strip(' -|,;')
    if not header:
        return '', ''

    if ' at ' in header.lower():
        role, company = re.split(r'\bat\b', header, maxsplit=1, flags=re.IGNORECASE)
        return role.strip(' -|'), company.strip(' -|')
    if ' @ ' in header:
        role, company = header.split('@', 1)
        return role.strip(' -|'), company.strip(' -|')

    parts = [part.strip() for part in re.split(r'\s+[|]\s+|\s+-\s+|\s+–\s+|\s+—\s+', header) if part.strip()]
    if len(parts) >= 2:
        left, right = parts[0], parts[1]
        if _looks_like_company(left) and not _looks_like_company(right):
            return right, left
        if _looks_like_role(left) and not _looks_like_role(right):
            return left, right
        return left, right

    comma_parts = [part.strip() for part in header.split(',', 1) if part.strip()]
    if len(comma_parts) == 2:
        left, right = comma_parts
        if _looks_like_company(left) and not _looks_like_company(right):
            return right, left
        return left, right

    return header, ''


def _parse_experience(section_text: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    if not section_text:
        return entries

    lines = [_clean_line(line) for line in section_text.splitlines() if _clean_line(line)]
    dated_lines: list[tuple[int, re.Match[str]]] = []
    for idx, line in enumerate(lines):
        match = DATE_RANGE_RE.search(line)
        if match:
            dated_lines.append((idx, match))

    if not dated_lines:
        return entries

    seen: set[tuple[str, str, dt.date | None]] = set()
    for item_index, (line_index, date_match) in enumerate(dated_lines):
        next_index = dated_lines[item_index + 1][0] if item_index + 1 < len(dated_lines) else len(lines)

        header_candidates: list[str] = []
        same_line_header = DATE_RANGE_RE.sub('', lines[line_index]).strip(' -|,;')
        if same_line_header:
            header_candidates.append(same_line_header)
        if line_index > 0:
            header_candidates.append(lines[line_index - 1])
        if line_index > 1:
            header_candidates.append(lines[line_index - 2])

        header = next((value for value in header_candidates if value and '@' not in value and 'http' not in value), '')
        if not header:
            continue

        role, company = _extract_role_company(header)
        if EDUCATION_HINT_RE.search(role) or EDUCATION_HINT_RE.search(company):
            continue
        header_has_separator = (
            (' at ' in header.lower())
            or (' @ ' in header)
            or ('|' in header)
            or bool(re.search(r'\s[-–—]\s', header))
        )
        if not _looks_like_role(role) and not header_has_separator:
            continue

        start_token = date_match.group('start')
        end_token = date_match.group('end')
        start_date = _parse_date_token(start_token)
        end_date = _parse_date_token(end_token)
        is_current = end_token.lower() in {'present', 'current', 'now'}
        if not start_date:
            continue

        highlights: list[str] = []
        for line in lines[line_index + 1 : next_index]:
            if DATE_RANGE_RE.search(line):
                continue
            cleaned = line.lstrip('-* ').strip()
            if not cleaned:
                continue
            if len(cleaned.split()) <= 8 and (' | ' in cleaned or ' - ' in cleaned or ' @ ' in cleaned):
                continue
            if len(cleaned) >= 18 or line.startswith(('-', '*')):
                highlights.append(cleaned[:260])

        if not role:
            role = 'Professional Experience'
        key = (role.lower().strip(), company.lower().strip(), start_date)
        if key in seen:
            continue
        seen.add(key)

        entries.append(
            {
                'role': role[:100],
                'company': company[:100],
                'start_date': start_date,
                'end_date': None if is_current else end_date,
                'is_current': is_current,
                'highlights': highlights[:6],
            }
        )
    return entries


def _parse_education(section_text: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    if not section_text:
        return entries

    lines = [_clean_line(line) for line in section_text.splitlines() if _clean_line(line)]
    if not lines:
        return entries

    dated_rows: list[tuple[int, re.Match[str]]] = []
    for idx, line in enumerate(lines):
        found = DATE_RANGE_RE.search(line)
        if found:
            dated_rows.append((idx, found))

    if dated_rows:
        for row_idx, (line_index, date_match) in enumerate(dated_rows):
            next_index = dated_rows[row_idx + 1][0] if row_idx + 1 < len(dated_rows) else len(lines)
            institution_line = DATE_RANGE_RE.sub('', lines[line_index]).strip(' -|,;')
            detail_lines = [
                line
                for line in lines[line_index + 1 : next_index]
                if not DATE_RANGE_RE.search(line)
            ]
            detail_line = detail_lines[0] if detail_lines else ''

            if detail_line and EDUCATION_HINT_RE.search(detail_line):
                degree = detail_line
                institution = institution_line
            else:
                degree = institution_line
                institution = detail_line

            if ' at ' in degree.lower():
                split_at = re.split(r'\bat\b', degree, maxsplit=1, flags=re.IGNORECASE)
                degree = split_at[0].strip()
                institution = split_at[1].strip() if len(split_at) > 1 else institution

            if not institution and ',' in degree:
                left, right = degree.split(',', 1)
                degree = left.strip()
                institution = right.strip()

            start_date = _parse_date_token(date_match.group('start'))
            end_token = date_match.group('end')
            is_current = end_token.lower() in {'present', 'current', 'now'}
            end_date = None if is_current else _parse_date_token(end_token)

            if degree or institution:
                entries.append(
                    {
                        'degree': degree[:140],
                        'institution': institution[:140],
                        'start_date': start_date,
                        'end_date': end_date,
                        'is_current': is_current,
                    }
                )
        return entries

    blocks = [block.strip() for block in re.split(r'\n\s*\n+', section_text) if block.strip()]
    for block in blocks:
        block_lines = [_clean_line(line) for line in block.splitlines() if _clean_line(line)]
        if not block_lines:
            continue
        degree = block_lines[0][:140]
        institution = block_lines[1][:140] if len(block_lines) > 1 else ''
        if degree or institution:
            entries.append(
                {
                    'degree': degree[:140],
                    'institution': institution[:140],
                    'start_date': None,
                    'end_date': None,
                    'is_current': False,
                }
            )
    return entries


def _parse_certifications(section_text: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    if not section_text:
        return entries
    seen: set[tuple[str, str]] = set()
    for raw_line in section_text.splitlines():
        line = _clean_line(raw_line).lstrip('-* ').strip()
        if not line:
            continue
        date_match = DATE_RANGE_RE.search(line)
        single_date_match = DATE_SINGLE_RE.search(line)
        issue_date = _parse_date_token(date_match.group('start')) if date_match else None
        if not issue_date and single_date_match:
            issue_date = _parse_date_token(single_date_match.group('date'))

        cleaned = DATE_RANGE_RE.sub('', line)
        cleaned = DATE_SINGLE_RE.sub('', cleaned).strip(' -|,;')
        cleaned = re.sub(r'\(\s*\)', '', cleaned).strip(' -|,;')
        cleaned = cleaned.rstrip('.').strip()
        if not cleaned:
            continue

        if ' by ' in cleaned.lower():
            name, issuer = re.split(r'\bby\b', cleaned, maxsplit=1, flags=re.IGNORECASE)
            name = name.strip()
            issuer = issuer.strip()
        elif ' from ' in cleaned.lower():
            name, issuer = re.split(r'\bfrom\b', cleaned, maxsplit=1, flags=re.IGNORECASE)
            name = name.strip()
            issuer = issuer.strip()
        elif ' - ' in cleaned:
            left, right = cleaned.split(' - ', 1)
            if _looks_like_company(right) or len(right.split()) <= 6:
                name, issuer = left.strip(), right.strip()
            else:
                name, issuer = cleaned, ''
        else:
            name = cleaned
            issuer = ''

        if len(name) < 3:
            continue
        dedupe_key = (name.lower().strip(), issuer.lower().strip())
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        entries.append({'name': name[:180], 'issuer': issuer[:140], 'issue_date': issue_date})
    return entries[:20]


def _parse_achievements(section_text: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    if not section_text:
        return entries
    seen = set()
    for raw_line in section_text.splitlines():
        line = _clean_line(raw_line)
        if not line:
            continue
        line = line.lstrip('-* ').strip()
        if len(line) < 4 or DATE_RANGE_RE.fullmatch(line):
            continue
        key = line.lower()
        if key in seen:
            continue
        seen.add(key)
        entries.append({'title': line[:180]})
    return entries[:20]


def _parse_projects(section_text: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    if not section_text:
        return entries

    blocks = [block.strip() for block in re.split(r'\n\s*\n+', section_text) if block.strip()]
    if not blocks:
        blocks = [section_text.strip()]

    seen_titles: set[str] = set()
    for block in blocks:
        lines = [_clean_line(line) for line in block.splitlines() if _clean_line(line)]
        if not lines:
            continue

        header_line = next((line for line in lines if not line.startswith(('-', '*'))), lines[0])
        body_lines = lines[1:] if len(lines) > 1 else []

        urls = URL_RE.findall(block)
        repo_url = next(
            (
                url
                for url in urls
                if any(host in url.lower() for host in ('github.com', 'gitlab.com', 'bitbucket.org'))
            ),
            '',
        )
        live_url = next((url for url in urls if url != repo_url), '')

        title = DATE_RANGE_RE.sub('', header_line)
        title = DATE_SINGLE_RE.sub('', title)
        title = URL_RE.sub('', title).strip(' -|,;:')
        if title.lower() in {'projects', 'project'}:
            continue
        if len(title) < 3:
            continue

        description_lines: list[str] = []
        for line in body_lines:
            cleaned = URL_RE.sub('', line).lstrip('-* ').strip()
            if not cleaned:
                continue
            if len(cleaned) < 3:
                continue
            description_lines.append(cleaned)

        if not description_lines:
            sentence = _clean_line(URL_RE.sub('', header_line)).strip()
            if sentence and sentence.lower() != title.lower():
                description_lines.append(sentence)

        description = '\n'.join(description_lines[:6]).strip()
        short_description = (description_lines[0] if description_lines else title)[:300]

        parsed_date = None
        date_match = DATE_RANGE_RE.search(block)
        if date_match:
            parsed_date = _parse_date_token(date_match.group('start'))
        if not parsed_date:
            single_date_match = DATE_SINGLE_RE.search(block)
            if single_date_match:
                parsed_date = _parse_date_token(single_date_match.group('date'))

        dedupe_key = title.lower().strip()
        if dedupe_key in seen_titles:
            continue
        seen_titles.add(dedupe_key)
        entries.append(
            {
                'title': title[:200],
                'short_description': short_description[:300],
                'description': description[:2000],
                'repo_url': repo_url[:300],
                'live_url': live_url[:300],
                'date_built': parsed_date,
                'category': 'other',
            }
        )
    return entries[:20]


def _parse_activities(section_text: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    if not section_text:
        return entries

    lines = [_clean_line(line) for line in section_text.splitlines() if _clean_line(line)]
    if not lines:
        return entries

    dated_rows: list[tuple[int, re.Match[str]]] = []
    for idx, line in enumerate(lines):
        found = DATE_RANGE_RE.search(line)
        if found:
            dated_rows.append((idx, found))

    seen: set[tuple[str, str]] = set()
    if dated_rows:
        for row_idx, (line_index, date_match) in enumerate(dated_rows):
            next_index = dated_rows[row_idx + 1][0] if row_idx + 1 < len(dated_rows) else len(lines)

            header_candidates: list[str] = []
            same_line_header = DATE_RANGE_RE.sub('', lines[line_index]).strip(' -|,;')
            if same_line_header:
                header_candidates.append(same_line_header)
            if line_index > 0:
                header_candidates.append(lines[line_index - 1])
            if line_index > 1:
                header_candidates.append(lines[line_index - 2])

            header = next((value for value in header_candidates if value and '@' not in value and 'http' not in value), '')
            if not header:
                continue

            role_guess, org_guess = _extract_role_company(header)
            title = header if org_guess and role_guess else (role_guess or header)
            role = role_guess if org_guess else ''
            organization = org_guess

            start_token = date_match.group('start')
            end_token = date_match.group('end')
            start_date = _parse_date_token(start_token)
            end_date = _parse_date_token(end_token)
            is_current = end_token.lower() in {'present', 'current', 'now'}

            highlights: list[str] = []
            for line in lines[line_index + 1 : next_index]:
                if DATE_RANGE_RE.search(line):
                    continue
                cleaned = line.lstrip('-* ').strip()
                if len(cleaned) >= 4:
                    highlights.append(cleaned[:260])

            dedupe_key = (title.lower().strip(), organization.lower().strip())
            if dedupe_key in seen:
                continue
            seen.add(dedupe_key)
            entries.append(
                {
                    'title': title[:160],
                    'organization': organization[:140],
                    'role': role[:140],
                    'start_date': start_date,
                    'end_date': None if is_current else end_date,
                    'is_current': is_current,
                    'highlights': highlights[:6],
                    'description': '\n'.join(highlights[:4])[:1000],
                }
            )

    if entries:
        return entries[:20]

    for raw_line in lines:
        cleaned = raw_line.lstrip('-* ').strip()
        if len(cleaned) < 4:
            continue
        role_guess, org_guess = _extract_role_company(cleaned)
        title = cleaned if org_guess and role_guess else (role_guess or cleaned)
        role = role_guess if org_guess else ''
        organization = org_guess
        dedupe_key = (title.lower().strip(), organization.lower().strip())
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        entries.append(
            {
                'title': title[:160],
                'organization': organization[:140],
                'role': role[:140],
                'start_date': None,
                'end_date': None,
                'is_current': False,
                'highlights': [],
                'description': '',
            }
        )
    return entries[:20]


def _build_section_report(
    *,
    sections: dict[str, str],
    full_name: str,
    tagline: str,
    contact: dict[str, str],
    skills: list[str],
    languages: list[str],
    projects: list[dict[str, Any]],
    experience: list[dict[str, Any]],
    education: list[dict[str, Any]],
    activities: list[dict[str, Any]],
    certifications: list[dict[str, Any]],
    achievements: list[dict[str, Any]],
    unknown_headings: list[str],
) -> dict[str, list[str]]:
    section_presence = {
        'personal_details': bool(full_name or tagline or contact),
        'summary': bool(sections.get('summary', '').strip()),
        'skills': bool(skills),
        'languages': bool(languages),
        'projects': bool(projects),
        'experience': bool(experience),
        'education': bool(education),
        'activities': bool(activities),
        'certifications': bool(certifications),
        'achievements': bool(achievements),
    }

    missing = [
        SECTION_DISPLAY_NAMES[key]
        for key in WEBSITE_SECTION_KEYS
        if not section_presence.get(key, False)
    ]

    neglected: list[str] = []
    seen: set[str] = set()
    for key in UNSUPPORTED_RESUME_SECTION_KEYS:
        if key not in sections:
            continue
        label = key.replace('_', ' ').title()
        label_key = label.lower()
        if label_key in seen:
            continue
        seen.add(label_key)
        neglected.append(label)

    for heading in unknown_headings:
        heading_key = heading.lower().strip()
        if heading_key in seen:
            continue
        seen.add(heading_key)
        neglected.append(heading)

    found = [
        SECTION_DISPLAY_NAMES[key]
        for key in WEBSITE_SECTION_KEYS
        if section_presence.get(key, False)
    ]
    return {
        'found': found,
        'missing': missing,
        'neglected': neglected,
    }


@dataclass
class ParsedResume:
    contact: dict[str, str]
    full_name: str
    tagline: str
    summary_text: str
    skills: list[str]
    languages: list[str]
    projects: list[dict[str, Any]]
    experience: list[dict[str, Any]]
    education: list[dict[str, Any]]
    activities: list[dict[str, Any]]
    certifications: list[dict[str, Any]]
    achievements: list[dict[str, Any]]
    section_report: dict[str, list[str]]

    def to_dict(self) -> dict[str, Any]:
        return {
            'contact': self.contact,
            'full_name': self.full_name,
            'tagline': self.tagline,
            'summary_text': self.summary_text,
            'skills': self.skills,
            'languages': self.languages,
            'projects': self.projects,
            'experience': self.experience,
            'education': self.education,
            'activities': self.activities,
            'certifications': self.certifications,
            'achievements': self.achievements,
            'section_report': self.section_report,
        }


def parse_resume_from_url(resume_url: str) -> ParsedResume:
    text = _extract_pdf_text(_download_resume_bytes(resume_url))
    if not text:
        raise RuntimeError('Resume PDF could not be read. Please upload a text-based PDF.')

    sections, unknown_headings = _split_sections(text)
    general_text = sections.get('general', text)
    contact_text = sections.get('contact', '')
    contact_source = f'{general_text}\n{contact_text}'.strip()
    contact = _extract_contact(contact_source)
    full_name, tagline = _guess_name_and_tagline(general_text, contact_text=contact_text)
    summary_text = sections.get('summary', '')[:1200]
    if not summary_text:
        summary_text = '\n'.join([_clean_line(line) for line in general_text.splitlines()[:6]])
    summary_text = summary_text[:1200]

    projects_text = sections.get('projects', '')
    experience_text = sections.get('experience', '')
    activities_text = sections.get('activities', '')
    certifications_text = sections.get('certifications', '')
    achievements_text = sections.get('achievements', '')

    parsed_projects = _parse_projects(projects_text)
    parsed_experience = _parse_experience(experience_text)
    parsed_activities = _parse_activities(activities_text)
    parsed_education = _parse_education(sections.get('education', ''))
    parsed_certifications = _parse_certifications(certifications_text)
    parsed_achievements = _parse_achievements(achievements_text)
    parsed_languages = _extract_languages(sections)
    parsed_skills = _extract_skills(text, sections)
    if parsed_languages:
        parsed_language_keys = {item.lower() for item in parsed_languages}
        parsed_skills = [item for item in parsed_skills if item.lower() not in parsed_language_keys]

    if not parsed_certifications:
        cert_lines = '\n'.join(
            line for line in text.splitlines()
            if any(keyword in line.lower() for keyword in ('certified', 'certification', 'certificate', 'license'))
        )
        parsed_certifications = _parse_certifications(cert_lines)

    if not parsed_achievements:
        achievement_lines = '\n'.join(
            line for line in text.splitlines()
            if any(keyword in line.lower() for keyword in ('award', 'achievement', 'honor', 'accomplishment'))
        )
        parsed_achievements = _parse_achievements(achievement_lines)

    section_report = _build_section_report(
        sections=sections,
        full_name=full_name,
        tagline=tagline,
        contact=contact,
        skills=parsed_skills,
        languages=parsed_languages,
        projects=parsed_projects,
        experience=parsed_experience,
        education=parsed_education,
        activities=parsed_activities,
        certifications=parsed_certifications,
        achievements=parsed_achievements,
        unknown_headings=unknown_headings,
    )

    return ParsedResume(
        contact=contact,
        full_name=full_name,
        tagline=tagline,
        summary_text=summary_text,
        skills=parsed_skills,
        languages=parsed_languages,
        projects=parsed_projects,
        experience=parsed_experience,
        education=parsed_education,
        activities=parsed_activities,
        certifications=parsed_certifications,
        achievements=parsed_achievements,
        section_report=section_report,
    )


def apply_parsed_resume(user, profile: Profile, parsed: ParsedResume, overwrite_existing: bool = False) -> dict[str, int]:
    counts = {
        'profile_updated': 0,
        'skills_created': 0,
        'languages_created': 0,
        'projects_created': 0,
        'experience_created': 0,
        'education_created': 0,
        'activities_created': 0,
        'certifications_created': 0,
        'achievements_created': 0,
    }

    profile_changed = False
    contact = parsed.contact
    profile_updates = {
        'full_name': parsed.full_name,
        'tagline': parsed.tagline,
        'bio': parsed.summary_text,
        'email': contact.get('email', ''),
        'github_url': contact.get('github_url', ''),
        'linkedin_url': contact.get('linkedin_url', ''),
        'twitter_url': contact.get('twitter_url', ''),
    }
    for field, value in profile_updates.items():
        if not value:
            continue
        current = getattr(profile, field, '')
        if overwrite_existing or not current:
            setattr(profile, field, value)
            profile_changed = True

    if profile_changed:
        profile.save()
        counts['profile_updated'] = 1

    if parsed.skills:
        category, _ = SkillCategory.objects.get_or_create(
            user=user,
            name='Core Skills',
            defaults={'order': 0},
        )
        existing_skill_names = set(Skill.objects.filter(user=user).values_list('name', flat=True))
        max_order = Skill.objects.filter(user=user).aggregate(value=Max('order')).get('value') or 0
        next_order = max_order + 1
        for skill_name in parsed.skills:
            if any(skill_name.lower() == existing.lower() for existing in existing_skill_names):
                continue
            Skill.objects.create(user=user, name=skill_name, category=category, order=next_order)
            existing_skill_names.add(skill_name)
            next_order += 1
            counts['skills_created'] += 1

    if parsed.languages:
        language_category, _ = SkillCategory.objects.get_or_create(
            user=user,
            name='Languages',
            defaults={'order': 1},
        )
        existing_language_names = set(Skill.objects.filter(user=user).values_list('name', flat=True))
        max_language_order = Skill.objects.filter(user=user).aggregate(value=Max('order')).get('value') or 0
        next_language_order = max_language_order + 1
        for language_name in parsed.languages:
            if any(language_name.lower() == existing.lower() for existing in existing_language_names):
                continue
            Skill.objects.create(
                user=user,
                name=language_name,
                category=language_category,
                order=next_language_order,
            )
            existing_language_names.add(language_name)
            next_language_order += 1
            counts['languages_created'] += 1

    if parsed.projects:
        existing_project_titles = {
            title.lower().strip()
            for title in Project.objects.filter(user=user).values_list('title', flat=True)
        }
        max_project_order = Project.objects.filter(user=user).aggregate(value=Max('order')).get('value') or 0
        next_project_order = max_project_order + 1
        for item in parsed.projects:
            title = (item.get('title') or '').strip()
            if not title:
                continue
            if title.lower() in existing_project_titles:
                continue
            Project.objects.create(
                user=user,
                title=title[:200],
                description=(item.get('description') or '')[:2000],
                short_description=(item.get('short_description') or '')[:300],
                category=(item.get('category') or 'other')[:50],
                live_url=(item.get('live_url') or '')[:300],
                repo_url=(item.get('repo_url') or '')[:300],
                date_built=item.get('date_built'),
                order=next_project_order,
            )
            existing_project_titles.add(title.lower())
            next_project_order += 1
            counts['projects_created'] += 1

    existing_experience_keys = {
        (item.role.lower().strip(), item.company.lower().strip())
        for item in Experience.objects.filter(user=user)
    }
    max_experience_order = Experience.objects.filter(user=user).aggregate(value=Max('order')).get('value') or 0
    next_experience_order = max_experience_order + 1
    for item in parsed.experience:
        key = (item['role'].lower().strip(), item['company'].lower().strip())
        if key in existing_experience_keys:
            continue
        Experience.objects.create(
            user=user,
            role=item['role'],
            company=item['company'] or 'Unknown',
            start_date=item['start_date'],
            end_date=item['end_date'],
            is_current=item['is_current'],
            highlights=item['highlights'],
            order=next_experience_order,
        )
        existing_experience_keys.add(key)
        next_experience_order += 1
        counts['experience_created'] += 1

    existing_education_keys = {
        (item.degree.lower().strip(), item.institution.lower().strip())
        for item in Education.objects.filter(user=user)
    }
    max_education_order = Education.objects.filter(user=user).aggregate(value=Max('order')).get('value') or 0
    next_education_order = max_education_order + 1
    for item in parsed.education:
        key = (item['degree'].lower().strip(), item['institution'].lower().strip())
        if key in existing_education_keys:
            continue
        Education.objects.create(
            user=user,
            degree=item['degree'] or 'Degree',
            institution=item['institution'] or 'Institution',
            start_date=item['start_date'],
            end_date=item['end_date'],
            is_current=item['is_current'],
            order=next_education_order,
        )
        existing_education_keys.add(key)
        next_education_order += 1
        counts['education_created'] += 1

    existing_activity_keys = {
        (item.title.lower().strip(), item.organization.lower().strip())
        for item in Activity.objects.filter(user=user)
    }
    max_activity_order = Activity.objects.filter(user=user).aggregate(value=Max('order')).get('value') or 0
    next_activity_order = max_activity_order + 1
    for item in parsed.activities:
        title = (item.get('title') or '').strip()
        organization = (item.get('organization') or '').strip()
        if not title:
            continue
        key = (title.lower(), organization.lower())
        if key in existing_activity_keys:
            continue
        Activity.objects.create(
            user=user,
            title=title[:160],
            organization=organization[:140],
            role=(item.get('role') or '')[:140],
            start_date=item.get('start_date'),
            end_date=item.get('end_date'),
            is_current=bool(item.get('is_current', False)),
            highlights=item.get('highlights') or [],
            description=(item.get('description') or '')[:1000],
            order=next_activity_order,
        )
        existing_activity_keys.add(key)
        next_activity_order += 1
        counts['activities_created'] += 1

    existing_cert_keys = {
        (item.name.lower().strip(), item.issuer.lower().strip())
        for item in Certification.objects.filter(user=user)
    }
    max_cert_order = Certification.objects.filter(user=user).aggregate(value=Max('order')).get('value') or 0
    next_cert_order = max_cert_order + 1
    for item in parsed.certifications:
        key = (item['name'].lower().strip(), item['issuer'].lower().strip())
        if key in existing_cert_keys:
            continue
        Certification.objects.create(
            user=user,
            name=item['name'],
            issuer=item['issuer'],
            issue_date=item['issue_date'],
            order=next_cert_order,
        )
        existing_cert_keys.add(key)
        next_cert_order += 1
        counts['certifications_created'] += 1

    existing_achievement_titles = set(Achievement.objects.filter(user=user).values_list('title', flat=True))
    max_achievement_order = Achievement.objects.filter(user=user).aggregate(value=Max('order')).get('value') or 0
    next_achievement_order = max_achievement_order + 1
    for item in parsed.achievements:
        if any(item['title'].lower() == title.lower() for title in existing_achievement_titles):
            continue
        Achievement.objects.create(
            user=user,
            title=item['title'],
            order=next_achievement_order,
        )
        existing_achievement_titles.add(item['title'])
        next_achievement_order += 1
        counts['achievements_created'] += 1

    return counts

