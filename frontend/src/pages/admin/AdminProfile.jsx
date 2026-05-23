import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  FaBookOpen,
  FaBolt,
  FaBriefcase,
  FaCertificate,
  FaCode,
  FaEnvelope,
  FaEnvelopeOpen,
  FaFileAlt,
  FaGithub,
  FaGlobe,
  FaGraduationCap,
  FaHome,
  FaImage,
  FaInfoCircle,
  FaLinkedin,
  FaLayerGroup,
  FaPhone,
  FaProjectDiagram,
  FaQuoteLeft,
  FaSave,
  FaTrophy,
  FaTwitter,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';
import FileUploader from '../../components/FileUploader';

const PROFILE_KEYS = [
  'full_name',
  'email',
  'phone',
  'tagline',
  'bio',
  'avatar',
  'resume',
  'website_url',
  'github_url',
  'linkedin_url',
  'twitter_url',
];

const SECTION_VISIBILITY_OPTIONS = [
  { key: 'show_hero', label: 'Hero', hint: 'Top introduction section', icon: FaHome },
  { key: 'show_about', label: 'About', hint: 'Bio and summary details', icon: FaInfoCircle },
  { key: 'show_highlights', label: 'Highlights', hint: 'Important now summary strip', icon: FaBolt },
  { key: 'show_skills', label: 'Skills', hint: 'Skills and technology categories', icon: FaCode },
  { key: 'show_projects', label: 'Projects', hint: 'Project cards and modal details', icon: FaProjectDiagram },
  { key: 'show_experience', label: 'Experience', hint: 'Work timeline section', icon: FaBriefcase },
  { key: 'show_education', label: 'Education', hint: 'Academic background section', icon: FaGraduationCap },
  { key: 'show_activities', label: 'Activities', hint: 'Extracurricular activities and community work', icon: FaUsers },
  { key: 'show_achievements', label: 'Achievements', hint: 'Awards and notable accomplishments', icon: FaTrophy },
  { key: 'show_certifications', label: 'Certifications', hint: 'Professional credentials and licenses', icon: FaCertificate },
  { key: 'show_blog', label: 'Articles', hint: 'Latest articles section', icon: FaBookOpen },
  { key: 'show_testimonials', label: 'Testimonials', hint: 'Client feedback section', icon: FaQuoteLeft },
  { key: 'show_contact', label: 'Contact', hint: 'Public contact form', icon: FaEnvelopeOpen },
];

const NAV_VISIBILITY_OPTIONS = [
  { key: 'show_nav_about', label: 'About', hint: 'Show About link in navbar', icon: FaInfoCircle },
  { key: 'show_nav_skills', label: 'Skills', hint: 'Show Skills link in navbar', icon: FaCode },
  { key: 'show_nav_projects', label: 'Projects', hint: 'Show Projects link in navbar', icon: FaProjectDiagram },
  { key: 'show_nav_experience', label: 'Experience', hint: 'Show Experience link in navbar', icon: FaBriefcase },
  { key: 'show_nav_education', label: 'Education', hint: 'Show Education link in navbar', icon: FaGraduationCap },
  { key: 'show_nav_activities', label: 'Activities', hint: 'Show Activities link in navbar', icon: FaUsers },
  { key: 'show_nav_achievements', label: 'Achievements', hint: 'Show Achievements link in navbar', icon: FaTrophy },
  { key: 'show_nav_certifications', label: 'Certifications', hint: 'Show Certifications link in navbar', icon: FaCertificate },
  { key: 'show_nav_blog', label: 'Articles', hint: 'Show Articles link in navbar', icon: FaBookOpen },
  { key: 'show_nav_testimonials', label: 'Testimonials', hint: 'Show Testimonials link in navbar', icon: FaQuoteLeft },
  { key: 'show_nav_contact', label: 'Contact', hint: 'Show Contact link in navbar', icon: FaEnvelopeOpen },
];

const NAV_OPTION_SECTION_MAP = {
  show_nav_about: 'show_about',
  show_nav_skills: 'show_skills',
  show_nav_projects: 'show_projects',
  show_nav_experience: 'show_experience',
  show_nav_education: 'show_education',
  show_nav_activities: 'show_activities',
  show_nav_achievements: 'show_achievements',
  show_nav_certifications: 'show_certifications',
  show_nav_blog: 'show_blog',
  show_nav_testimonials: 'show_testimonials',
  show_nav_contact: 'show_contact',
};

const VISIBILITY_HINT_LIMIT = 5;

const DEFAULT_SECTION_VISIBILITY = SECTION_VISIBILITY_OPTIONS.reduce((accumulator, option) => {
  accumulator[option.key] = true;
  return accumulator;
}, {});

const DEFAULT_NAV_VISIBILITY = NAV_VISIBILITY_OPTIONS.reduce((accumulator, option) => {
  accumulator[option.key] = true;
  return accumulator;
}, {});

const EDITABLE_PROFILE_KEYS = [
  ...PROFILE_KEYS,
  ...SECTION_VISIBILITY_OPTIONS.map((option) => option.key),
  ...NAV_VISIBILITY_OPTIONS.map((option) => option.key),
];

const PROFILE_VIEW_MODES = [
  { id: 'details', label: 'Profile Details', icon: FaUser },
  { id: 'visibility', label: 'Visibility', icon: FaLayerGroup },
  { id: 'resume', label: 'Resume Extract', icon: FaBolt },
];
const PROFILE_VIEW_MODE_IDS = new Set(PROFILE_VIEW_MODES.map((mode) => mode.id));

const MODE_COPY = {
  details: {
    eyebrow: 'Identity Setup',
    title: 'Polish the public-facing profile details.',
    text: 'Keep the basics, story, assets, and social links current so students and professionals can publish a complete portfolio faster.',
  },
  visibility: {
    eyebrow: 'Visibility Rules',
    title: 'Control what the public portfolio actually shows.',
    text: 'Toggle sections and navbar links without touching content records, so your public portfolio stays intentional.',
  },
  resume: {
    eyebrow: 'Resume Import',
    title: 'Preview extracted data before you merge it.',
    text: 'Use resume extraction to speed up setup, then decide what should overwrite existing profile information.',
  },
};

const EMPTY_VISIBILITY_CONTENT = Object.freeze({
  skills: [],
  projects: [],
  experience: [],
  education: [],
  activities: [],
  achievements: [],
  certifications: [],
  blogs: [],
  testimonials: [],
});

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const unwrapCollection = (response) => {
  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const buildSectionAvailability = (profile, content) => {
  const visibleProjects = content.projects.filter((item) => item?.is_visible !== false);
  const publishedBlogs = content.blogs.filter((item) => item?.is_published);
  const skillCount = content.skills.length;
  const hasAboutContent =
    hasText(profile?.bio)
    || hasText(profile?.tagline)
    || hasText(profile?.avatar)
    || skillCount > 0
    || visibleProjects.length > 0
    || content.experience.length > 0;

  return {
    show_hero: true,
    show_about: hasAboutContent,
    show_highlights:
      visibleProjects.length > 0
      || publishedBlogs.length > 0
      || content.testimonials.length > 0
      || content.education.length > 0
      || content.activities.length > 0
      || content.achievements.length > 0
      || content.certifications.length > 0,
    show_skills: skillCount > 0,
    show_projects: visibleProjects.length > 0,
    show_experience: content.experience.length > 0,
    show_education: content.education.length > 0,
    show_activities: content.activities.length > 0,
    show_achievements: content.achievements.length > 0,
    show_certifications: content.certifications.length > 0,
    show_blog: publishedBlogs.length > 0,
    show_testimonials: content.testimonials.length > 0,
    show_contact: true,
  };
};

function VisibilityToggleCard({ option, checked, onChange, note }) {
  const Icon = option.icon;

  return (
    <label className={`admin-visibility-row ${checked ? 'admin-visibility-row--active' : ''}`}>
      <span className="admin-visibility-row__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="admin-visibility-row__copy">
        <strong>{option.label}</strong>
        <small>{note || option.hint}</small>
      </span>
      <span className="admin-visibility-row__control">
        <input
          type="checkbox"
          name={option.key}
          checked={checked}
          onChange={onChange}
        />
        <span className="admin-visibility-row__switch" aria-hidden="true" />
      </span>
    </label>
  );
}

const filledCount = (profile) =>
  PROFILE_KEYS.filter((key) => {
    const value = profile?.[key];
    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  }).length;

export default function AdminProfile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view');
  const [profile, setProfile] = useState(null);
  const [savedProfileSnapshot, setSavedProfileSnapshot] = useState(null);
  const [visibilityContent, setVisibilityContent] = useState(EMPTY_VISIBILITY_CONTENT);
  const [activeViewMode, setActiveViewMode] = useState(
    PROFILE_VIEW_MODE_IDS.has(initialView) ? initialView : 'details'
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [isSavingResumeExtract, setIsSavingResumeExtract] = useState(false);
  const [overwriteExtractOnSave, setOverwriteExtractOnSave] = useState(false);
  const [resumePreview, setResumePreview] = useState(null);
  const resumeUrl = profile?.resume_download_url || profile?.resume || '';
  const isBusy = isSubmitting || isSavingAsset || isExtractingResume || isSavingResumeExtract;

  const normalizeProfileForCompare = (value) => {
    if (!value) return null;
    const normalized = {};
    EDITABLE_PROFILE_KEYS.forEach((key) => {
      const raw = value[key];
      if (typeof raw === 'string') {
        normalized[key] = raw.trim();
      } else if (typeof raw === 'boolean') {
        normalized[key] = raw;
      } else if (raw === undefined || raw === null) {
        normalized[key] = '';
      } else {
        normalized[key] = raw;
      }
    });
    return normalized;
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!profile || !savedProfileSnapshot) return false;
    return JSON.stringify(normalizeProfileForCompare(profile))
      !== JSON.stringify(normalizeProfileForCompare(savedProfileSnapshot));
  }, [profile, savedProfileSnapshot]);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const results = await Promise.allSettled([
          userApi.getProfile(),
          userApi.getSkills(),
          userApi.getProjects(),
          userApi.getExperience(),
          userApi.getEducation(),
          userApi.getActivities(),
          userApi.getAchievements(),
          userApi.getCertifications(),
          userApi.getBlogs(),
          userApi.getTestimonials(),
        ]);

        if (cancelled) return;

        const [
          profileResult,
          skillsResult,
          projectsResult,
          experienceResult,
          educationResult,
          activitiesResult,
          achievementsResult,
          certificationsResult,
          blogsResult,
          testimonialsResult,
        ] = results;

        if (profileResult.status !== 'fulfilled') {
          throw profileResult.reason;
        }

        const merged = { ...DEFAULT_SECTION_VISIBILITY, ...DEFAULT_NAV_VISIBILITY, ...profileResult.value.data };
        setProfile(merged);
        setSavedProfileSnapshot(merged);
        setVisibilityContent({
          skills: skillsResult.status === 'fulfilled' ? unwrapCollection(skillsResult.value) : [],
          projects: projectsResult.status === 'fulfilled' ? unwrapCollection(projectsResult.value) : [],
          experience: experienceResult.status === 'fulfilled' ? unwrapCollection(experienceResult.value) : [],
          education: educationResult.status === 'fulfilled' ? unwrapCollection(educationResult.value) : [],
          activities: activitiesResult.status === 'fulfilled' ? unwrapCollection(activitiesResult.value) : [],
          achievements: achievementsResult.status === 'fulfilled' ? unwrapCollection(achievementsResult.value) : [],
          certifications: certificationsResult.status === 'fulfilled' ? unwrapCollection(certificationsResult.value) : [],
          blogs: blogsResult.status === 'fulfilled' ? unwrapCollection(blogsResult.value) : [],
          testimonials: testimonialsResult.status === 'fulfilled' ? unwrapCollection(testimonialsResult.value) : [],
        });
      } catch {
        if (!cancelled) {
          toast.error('Failed to load profile');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges || isSubmitting) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitting]);

  useEffect(() => {
    const requestedView = searchParams.get('view');
    if (!PROFILE_VIEW_MODE_IDS.has(requestedView)) {
      if (activeViewMode !== 'details') {
        setActiveViewMode('details');
      }
      return;
    }
    if (requestedView !== activeViewMode) {
      setActiveViewMode(requestedView);
    }
  }, [activeViewMode, searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeViewMode]);

  const completion = useMemo(() => {
    const count = filledCount(profile);
    return {
      count,
      total: PROFILE_KEYS.length,
      percent: Math.round((count / PROFILE_KEYS.length) * 100) || 0,
    };
  }, [profile]);

  const sectionAvailability = useMemo(
    () => buildSectionAvailability(profile, visibilityContent),
    [profile, visibilityContent]
  );
  const availableSectionOptions = useMemo(
    () => SECTION_VISIBILITY_OPTIONS.filter((option) => sectionAvailability[option.key] !== false),
    [sectionAvailability]
  );
  const unavailableSectionOptions = useMemo(
    () => SECTION_VISIBILITY_OPTIONS.filter((option) => sectionAvailability[option.key] === false),
    [sectionAvailability]
  );
  const availableNavOptions = useMemo(
    () => NAV_VISIBILITY_OPTIONS.filter((option) => sectionAvailability[NAV_OPTION_SECTION_MAP[option.key]] !== false),
    [sectionAvailability]
  );
  const unavailableNavOptions = useMemo(
    () => NAV_VISIBILITY_OPTIONS.filter((option) => sectionAvailability[NAV_OPTION_SECTION_MAP[option.key]] === false),
    [sectionAvailability]
  );
  const visibleSectionCount = useMemo(
    () => availableSectionOptions.filter((option) => profile?.[option.key] !== false).length,
    [availableSectionOptions, profile]
  );
  const visibleNavCount = useMemo(
    () => availableNavOptions.filter(
      (option) => profile?.[option.key] !== false && profile?.[NAV_OPTION_SECTION_MAP[option.key]] !== false
    ).length,
    [availableNavOptions, profile]
  );
  const hiddenSectionCount = availableSectionOptions.length - visibleSectionCount;
  const hiddenNavCount = availableNavOptions.length - visibleNavCount;
  const sectionLimitExceeded = visibleSectionCount > VISIBILITY_HINT_LIMIT;
  const navLimitExceeded = visibleNavCount > VISIBILITY_HINT_LIMIT;
  const previewStats = useMemo(() => ({
    skills: resumePreview?.skills?.length || 0,
    languages: resumePreview?.languages?.length || 0,
    projects: resumePreview?.projects?.length || 0,
    experience: resumePreview?.experience?.length || 0,
    education: resumePreview?.education?.length || 0,
    activities: resumePreview?.activities?.length || 0,
    certifications: resumePreview?.certifications?.length || 0,
    achievements: resumePreview?.achievements?.length || 0,
  }), [resumePreview]);
  const resumeQualityReport = resumePreview?.quality_report || null;
  const canSaveResumeExtract = Boolean(
    resumePreview
    && resumeQualityReport?.save_recommended !== false
  );
  const socialLinks = useMemo(() => ([
    { label: 'Website', url: profile?.website_url, icon: FaGlobe },
    { label: 'GitHub', url: profile?.github_url, icon: FaGithub },
    { label: 'LinkedIn', url: profile?.linkedin_url, icon: FaLinkedin },
    { label: 'Twitter', url: profile?.twitter_url, icon: FaTwitter },
  ]), [profile?.website_url, profile?.github_url, profile?.linkedin_url, profile?.twitter_url]);
  const connectedSocialLinks = useMemo(
    () => socialLinks.filter((item) => typeof item.url === 'string' && item.url.trim().length > 0),
    [socialLinks]
  );
  const profileHandle = useMemo(
    () => profile?.username || profile?.username_slug || profile?.email?.split('@')[0] || '',
    [profile?.username, profile?.username_slug, profile?.email]
  );
  const profileInitials = useMemo(() => {
    const source = profile?.full_name || profileHandle || 'U';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'U';
  }, [profile?.full_name, profileHandle]);
  const overviewStats = useMemo(() => ([
    {
      label: 'Profile Completion',
      value: `${completion.percent}%`,
      tone: completion.percent >= 75 ? 'cyan' : 'accent',
      hint: `${completion.count}/${completion.total} core fields filled`,
    },
    {
      label: 'Public Sections',
      value: visibleSectionCount,
      tone: sectionLimitExceeded ? 'pink' : visibleSectionCount >= 3 ? 'cyan' : 'accent',
      hint: `${availableSectionOptions.length} ready to toggle`,
    },
    {
      label: 'Navbar Links',
      value: visibleNavCount,
      tone: navLimitExceeded ? 'pink' : visibleNavCount >= 3 ? 'cyan' : 'accent',
      hint: `${availableNavOptions.length} ready to toggle`,
    },
    {
      label: 'Connected Socials',
      value: connectedSocialLinks.length,
      tone: connectedSocialLinks.length >= 2 ? 'cyan' : 'pink',
      hint: connectedSocialLinks.length > 0 ? 'Links visible on public profile' : 'No social links added yet',
    },
  ]), [
    availableNavOptions.length,
    availableSectionOptions.length,
    completion,
    connectedSocialLinks.length,
    navLimitExceeded,
    sectionLimitExceeded,
    visibleNavCount,
    visibleSectionCount,
  ]);
  const profileChecklist = useMemo(() => ([
    { label: 'Avatar', ready: Boolean(profile?.avatar) },
    { label: 'Resume', ready: Boolean(resumeUrl) },
    { label: 'Bio', ready: Boolean(profile?.bio?.trim()) },
    { label: 'Tagline', ready: Boolean(profile?.tagline?.trim()) },
  ]), [profile?.avatar, resumeUrl, profile?.bio, profile?.tagline]);
  const activeModeCopy = MODE_COPY[activeViewMode];

  const formatDateLabel = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProfile((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleViewModeChange = (nextView) => {
    setActiveViewMode(nextView);
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === 'details') {
      nextParams.delete('view');
    } else {
      nextParams.set('view', nextView);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const setVisibilityGroup = (options, nextValue) => {
    setProfile((prev) => ({
      ...prev,
      ...Object.fromEntries(options.map((option) => [option.key, nextValue])),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasUnsavedChanges) {
      toast('No changes to save.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await userApi.updateProfile(profile);
      const merged = { ...profile, ...(response?.data || {}) };
      setProfile(merged);
      setSavedProfileSnapshot(merged);
      toast.success('Profile updated');
    } catch (error) {
      const errors = error.response?.data;
      const message = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const persistUploadedAsset = async (field, url) => {
    setProfile((prev) => ({ ...(prev || {}), [field]: url }));
    if (field === 'resume') {
      setResumePreview(null);
    }
    setIsSavingAsset(true);
    try {
      const response = await userApi.patchProfile({ [field]: url });
      setProfile((prev) => {
        const merged = { ...(prev || {}), ...(response?.data || {}), [field]: url };
        setSavedProfileSnapshot(merged);
        return merged;
      });
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(detail || `Uploaded ${field}, but failed to save profile.`);
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleResumeExtractPreview = async () => {
    if (!profile?.resume) {
      toast.error('Upload resume first, then extract preview.');
      return;
    }
    setIsExtractingResume(true);
    try {
      const response = await userApi.autofillResume({ preview_only: true });
      const parsed = response?.data?.parsed;
      if (!parsed) {
        toast.error('Resume was parsed, but no preview data was returned.');
        return;
      }
      setResumePreview(parsed);
      toast.success(response?.data?.detail || 'Resume extracted for preview.');
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(detail || 'Resume extraction failed.');
    } finally {
      setIsExtractingResume(false);
    }
  };

  const handleSaveExtractedResume = async () => {
    if (!profile?.resume) {
      toast.error('Upload resume first, then extract preview.');
      return;
    }
    if (!resumePreview) {
      toast.error('Extract preview first, then save.');
      return;
    }
    if (!canSaveResumeExtract) {
      toast.error('This extract is too unreliable to save. Upload a cleaner text-based PDF and retry.');
      return;
    }
    setIsSavingResumeExtract(true);
    try {
      const response = await userApi.autofillResume({
        overwrite_existing: overwriteExtractOnSave,
        preview_only: false,
      });
      const summary = response?.data?.summary || {};
      const detail = response?.data?.detail || 'Extracted resume data saved.';
      toast.success(
        `${detail} Added: ${summary.skills_created || 0} skills, `
        + `${summary.languages_created || 0} languages, `
        + `${summary.projects_created || 0} projects, `
        + `${summary.experience_created || 0} experience, `
        + `${summary.education_created || 0} education, `
        + `${summary.activities_created || 0} activities, `
        + `${summary.certifications_created || 0} certifications, `
        + `${summary.achievements_created || 0} achievements.`
      );
      const updatedProfile = await userApi.getProfile();
      setProfile((prev) => {
        const merged = { ...(prev || {}), ...(updatedProfile?.data || {}) };
        setSavedProfileSnapshot(merged);
        return merged;
      });
      setResumePreview(null);
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(detail || 'Failed to save extracted resume data.');
    } finally {
      setIsSavingResumeExtract(false);
    }
  };

  const handleResetChanges = () => {
    if (!savedProfileSnapshot) return;
    setProfile(savedProfileSnapshot);
    toast.success('Unsaved changes were reset.');
  };

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Profile</h1>
        </div>
        <LoadingSkeleton variant="text" count={8} />
      </div>
    );
  }

  return (
    <div className="admin-content-page">
      <div className="admin-page-header admin-content-page__header">
        <div>
          <h1>Profile</h1>
          <p>Keep your public identity current and complete.</p>
        </div>
      </div>

      {activeViewMode === 'details' && (
      <section className="admin-profile-hero glass">
        <div className="admin-profile-hero__identity">
          <div className="admin-profile-hero__avatar">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Profile avatar" />
            ) : (
              <span>{profileInitials}</span>
            )}
          </div>
          <div className="admin-profile-hero__copy">
            <p className="admin-dashboard__eyebrow">{activeModeCopy.eyebrow}</p>
            <h2>{profile?.full_name || activeModeCopy.title}</h2>
            <p className="admin-profile-hero__tagline">
              {profile?.tagline || 'Make your public profile clearer, stronger, and easier to trust.'}
            </p>
            <p className="admin-profile-hero__subtext">{activeModeCopy.text}</p>
            <div className="admin-profile-hero__chips">
              {profileChecklist.map((item) => (
                <span key={item.label} className={`chip ${item.ready ? 'chip-active' : ''}`}>
                  {item.label}: {item.ready ? 'Ready' : 'Missing'}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-profile-hero__side">
          <div className="admin-profile-hero__stats">
            {overviewStats.map((item) => (
              <article key={item.label} className={`admin-profile-hero__stat admin-profile-hero__stat--${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.hint}</small>
              </article>
            ))}
          </div>
          <div className="admin-profile-hero__actions">
            {connectedSocialLinks.length > 0 ? (
              connectedSocialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer" className="chip">
                    <Icon /> {item.label}
                  </a>
                );
              })
            ) : (
              <span className="chip">No social links connected</span>
            )}
          </div>
        </div>
      </section>
      )}

      <div className="admin-profile-modes glass">
        <div className="admin-profile-modes__tabs">
          {PROFILE_VIEW_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                className={`admin-profile-modes__tab ${activeViewMode === mode.id ? 'admin-profile-modes__tab--active' : ''}`}
                onClick={() => handleViewModeChange(mode.id)}
              >
                <Icon />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeViewMode === 'resume' && (
      <section className="admin-resume-extract glass">
        <div className="admin-resume-extract__header">
          <div>
            <p className="admin-dashboard__eyebrow">Resume Extraction</p>
            <h2 className="admin-dashboard__headline">Preview Before Save</h2>
            <p className="admin-dashboard__subtext">
              Extracted data stays temporary until you click Save Extracted Data. Resume uploads are temporarily unrestricted.
            </p>
          </div>
          <div className="admin-resume-extract__actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleResumeExtractPreview}
              disabled={!profile?.resume || isExtractingResume || isSavingResumeExtract}
            >
              <FaBolt /> {isExtractingResume ? 'Extracting...' : 'Extract Resume'}
            </button>
            <label className="admin-resume-extract__overwrite">
              <input
                type="checkbox"
                checked={overwriteExtractOnSave}
                onChange={(event) => setOverwriteExtractOnSave(event.target.checked)}
                disabled={isExtractingResume || isSavingResumeExtract}
              />
              Overwrite existing records on save
            </label>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveExtractedResume}
              disabled={!canSaveResumeExtract || isExtractingResume || isSavingResumeExtract}
            >
              <FaSave /> {isSavingResumeExtract ? 'Saving Extract...' : 'Save Extracted Data'}
            </button>
          </div>
        </div>

        {resumeUrl ? (
          <div className="admin-profile-callout">
            <strong>Saved resume detected</strong>
            <p>Your current resume is ready for extraction. You can open it, replace it, then extract again.</p>
            <div className="admin-profile-callout__chips">
              <span className="chip chip-active">Resume Ready</span>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="chip">
                Open Saved Resume
              </a>
            </div>
            <div className="admin-form__row">
              <FileUploader
                label="Replace Resume"
                accept=".pdf,application/pdf"
                buttonText="Upload New Resume"
                uploadContext="resume"
                helpText="PDF only. Replacing the resume clears the old extract preview."
                disabled={isExtractingResume || isSavingResumeExtract}
                onUploaded={(url) => { persistUploadedAsset('resume', url); }}
              />
            </div>
          </div>
        ) : (
          <div className="admin-profile-callout admin-profile-callout--warning">
            <strong>No resume saved</strong>
            <p>Upload a resume here to enable extraction. Once uploaded, you can preview and save extracted data.</p>
            <div className="admin-form__row">
              <FileUploader
                label="Upload Resume"
                accept=".pdf,application/pdf"
                buttonText="Upload Resume"
                uploadContext="resume"
                helpText="PDF only. Auto-saves after upload."
                disabled={isExtractingResume || isSavingResumeExtract}
                onUploaded={(url) => { persistUploadedAsset('resume', url); }}
              />
            </div>
          </div>
        )}

        {profile?.resume && !resumePreview && (
          <div className="admin-profile-callout">
            <strong>Ready to extract</strong>
            <p>Run extraction to preview how your resume maps into profile, projects, experience, education, and certifications.</p>
          </div>
        )}

        {resumePreview && (
          <div className="admin-resume-extract__preview">
            {resumeQualityReport && (
              <div className={`admin-profile-callout ${resumeQualityReport.save_recommended ? '' : 'admin-profile-callout--warning'}`}>
                <strong>
                  Extraction quality: {resumeQualityReport.quality_label || 'unknown'}
                  {' '}
                  ({resumeQualityReport.quality_score ?? 0}/100)
                </strong>
                <p>
                  Method: {resumeQualityReport.extraction_method || 'unknown'}.
                  {resumeQualityReport.save_recommended
                    ? ' Review the preview before saving.'
                    : ' Saving is disabled because this extraction looks unreliable.'}
                </p>
                {Array.isArray(resumeQualityReport.warnings) && resumeQualityReport.warnings.length > 0 && (
                  <div className="admin-profile-callout__chips">
                    {resumeQualityReport.warnings.map((warning, index) => (
                      <span key={`quality-warning-${index}`} className="chip">{warning}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="admin-resume-extract__chips">
              <span className="chip chip-active">{previewStats.skills} skills</span>
              <span className="chip chip-active">{previewStats.languages} languages</span>
              <span className="chip chip-active">{previewStats.projects} projects</span>
              <span className="chip chip-active">{previewStats.experience} experience</span>
              <span className="chip chip-active">{previewStats.education} education</span>
              <span className="chip chip-active">{previewStats.activities} activities</span>
              <span className="chip chip-active">{previewStats.certifications} certifications</span>
              <span className="chip chip-active">{previewStats.achievements} achievements</span>
            </div>

            {(resumePreview.full_name || resumePreview.tagline || resumePreview.summary_text) && (
              <div className="admin-resume-extract__block">
                <h3>Profile Preview</h3>
                {resumePreview.full_name && <p><strong>Name:</strong> {resumePreview.full_name}</p>}
                {resumePreview.tagline && <p><strong>Tagline:</strong> {resumePreview.tagline}</p>}
                {resumePreview?.contact?.phone && <p><strong>Phone:</strong> {resumePreview.contact.phone}</p>}
                {resumePreview?.contact?.email && <p><strong>Email:</strong> {resumePreview.contact.email}</p>}
                {resumePreview?.contact?.website_url && <p><strong>Website:</strong> {resumePreview.contact.website_url}</p>}
                {resumePreview?.contact?.linkedin_url && <p><strong>LinkedIn:</strong> {resumePreview.contact.linkedin_url}</p>}
                {resumePreview?.contact?.github_url && <p><strong>GitHub:</strong> {resumePreview.contact.github_url}</p>}
                {resumePreview.summary_text && <p className="admin-resume-extract__summary">{resumePreview.summary_text}</p>}
              </div>
            )}

            {Array.isArray(resumePreview.skills) && resumePreview.skills.length > 0 && (
              <div className="admin-resume-extract__block">
                <h3>Skills Preview</h3>
                <div className="admin-resume-extract__chips">
                  {resumePreview.skills.slice(0, 20).map((skill) => (
                    <span key={skill} className="chip">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(resumePreview.languages) && resumePreview.languages.length > 0 && (
              <div className="admin-resume-extract__block">
                <h3>Languages Preview</h3>
                <div className="admin-resume-extract__chips">
                  {resumePreview.languages.slice(0, 20).map((language) => (
                    <span key={language} className="chip">{language}</span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(resumePreview.experience) && resumePreview.experience.length > 0 && (
              <div className="admin-resume-extract__block">
                <h3>Experience Preview</h3>
                <div className="admin-resume-extract__list">
                  {resumePreview.experience.slice(0, 4).map((item, index) => (
                    <article key={`${item.role}-${item.company}-${index}`} className="admin-resume-extract__item">
                      <strong>{item.role || 'Role'}</strong>
                      <p>{item.company || 'Company'}</p>
                      <small>
                        {formatDateLabel(item.start_date) || 'Start'} - {item.is_current ? 'Present' : (formatDateLabel(item.end_date) || 'End')}
                      </small>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(resumePreview.projects) && resumePreview.projects.length > 0 && (
              <div className="admin-resume-extract__block">
                <h3>Projects Preview</h3>
                <div className="admin-resume-extract__list">
                  {resumePreview.projects.slice(0, 4).map((item, index) => (
                    <article key={`${item.title}-${index}`} className="admin-resume-extract__item">
                      <strong>{item.title || 'Project'}</strong>
                      {(item.short_description || item.description) && <p>{item.short_description || item.description}</p>}
                      {item.date_built && <small>{formatDateLabel(item.date_built)}</small>}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(resumePreview.education) && resumePreview.education.length > 0 && (
              <div className="admin-resume-extract__block">
                <h3>Education Preview</h3>
                <div className="admin-resume-extract__list">
                  {resumePreview.education.slice(0, 4).map((item, index) => (
                    <article key={`${item.degree}-${item.institution}-${index}`} className="admin-resume-extract__item">
                      <strong>{item.degree || 'Degree'}</strong>
                      <p>{item.institution || 'Institution'}</p>
                      <small>
                        {formatDateLabel(item.start_date) || 'Start'} - {item.is_current ? 'Present' : (formatDateLabel(item.end_date) || 'End')}
                      </small>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(resumePreview.activities) && resumePreview.activities.length > 0 && (
              <div className="admin-resume-extract__block">
                <h3>Activities Preview</h3>
                <div className="admin-resume-extract__list">
                  {resumePreview.activities.slice(0, 4).map((item, index) => (
                    <article key={`${item.title}-${item.organization}-${index}`} className="admin-resume-extract__item">
                      <strong>{item.title || 'Activity'}</strong>
                      {(item.organization || item.role) && <p>{[item.role, item.organization].filter(Boolean).join(' at ')}</p>}
                      {(item.start_date || item.end_date || item.is_current) && (
                        <small>
                          {formatDateLabel(item.start_date) || 'Start'} - {item.is_current ? 'Present' : (formatDateLabel(item.end_date) || 'End')}
                        </small>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(resumePreview.certifications) && resumePreview.certifications.length > 0 && (
              <div className="admin-resume-extract__block">
                <h3>Certification Preview</h3>
                <div className="admin-resume-extract__list">
                  {resumePreview.certifications.slice(0, 6).map((item, index) => (
                    <article key={`${item.name}-${item.issuer}-${index}`} className="admin-resume-extract__item">
                      <strong>{item.name || 'Certification'}</strong>
                      {item.issuer && <p>{item.issuer}</p>}
                      {item.issue_date && <small>{formatDateLabel(item.issue_date)}</small>}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(resumePreview.achievements) && resumePreview.achievements.length > 0 && (
              <div className="admin-resume-extract__block">
                <h3>Achievement Preview</h3>
                <div className="admin-resume-extract__list">
                  {resumePreview.achievements.slice(0, 6).map((item, index) => (
                    <article key={`${item.title}-${index}`} className="admin-resume-extract__item">
                      <strong>{item.title || 'Achievement'}</strong>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {(Array.isArray(resumePreview?.section_report?.missing) && resumePreview.section_report.missing.length > 0)
              || (Array.isArray(resumePreview?.section_report?.neglected) && resumePreview.section_report.neglected.length > 0) ? (
                <div className="admin-resume-extract__block">
                  <h3>Section Coverage</h3>
                  {Array.isArray(resumePreview?.section_report?.missing) && resumePreview.section_report.missing.length > 0 && (
                    <>
                      <p>Missing in resume:</p>
                      <div className="admin-resume-extract__chips">
                        {resumePreview.section_report.missing.map((sectionName) => (
                          <span key={`missing-${sectionName}`} className="chip">{sectionName}</span>
                        ))}
                      </div>
                    </>
                  )}
                  {Array.isArray(resumePreview?.section_report?.neglected) && resumePreview.section_report.neglected.length > 0 && (
                    <>
                      <p>Neglected (not mapped to current website sections):</p>
                      <div className="admin-resume-extract__chips">
                        {resumePreview.section_report.neglected.map((sectionName) => (
                          <span key={`neglected-${sectionName}`} className="chip">{sectionName}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : null}
          </div>
        )}
      </section>
      )}

      {activeViewMode !== 'resume' && (
      <Motion.form
        className="admin-profile-form glass"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="admin-profile-grid">
          {activeViewMode === 'details' && (
          <>
          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-basics" className="admin-profile-anchor" />
            <h3 className="admin-profile-section__title">
              <FaUser /> Basics
            </h3>
            <p className="admin-profile-section__intro">
              Set the public name, email, and one-line positioning visitors will see first.
            </p>
            <div className="admin-form__row">
              <FormField
                label="Full Name"
                name="full_name"
                value={profile?.full_name || ''}
                onChange={handleChange}
                icon={FaUser}
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={profile?.email || ''}
                onChange={handleChange}
                icon={FaEnvelope}
                required
              />
            </div>
            <div className="admin-form__row">
              <FormField
                label="Phone"
                name="phone"
                value={profile?.phone || ''}
                onChange={handleChange}
                icon={FaPhone}
              />
              <FormField
                label="Tagline"
                name="tagline"
                value={profile?.tagline || ''}
                onChange={handleChange}
                icon={FaBriefcase}
                hint="Example: Full-Stack Python Developer"
              />
            </div>
          </section>

          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-about" className="admin-profile-anchor" />
            <h3 className="admin-profile-section__title">
              <FaInfoCircle /> About
            </h3>
            <p className="admin-profile-section__intro">
              Write a short summary that explains who you are, what you do, and why your work matters.
            </p>
            <FormField
              label="Bio"
              name="bio"
              type="textarea"
              value={profile?.bio || ''}
              onChange={handleChange}
              icon={FaFileAlt}
              rows={6}
              hint={`${(profile?.bio || '').length} characters`}
            />
          </section>

          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-assets" className="admin-profile-anchor" />
            <h3 className="admin-profile-section__title">
              <FaImage /> Assets
            </h3>
            <p className="admin-profile-section__intro">
              Manage the media and downloadable files used across the public portfolio.
            </p>
            <div className="admin-profile-section__meta">
              <span className={`chip ${profile?.avatar ? 'chip-active' : ''}`}>
                Avatar {profile?.avatar ? 'Ready' : 'Missing'}
              </span>
              <span className={`chip ${resumeUrl ? 'chip-active' : ''}`}>
                Resume {resumeUrl ? 'Ready' : 'Missing'}
              </span>
            </div>
            <div className="admin-form__row">
              <FormField
                label="Avatar URL"
                name="avatar"
                value={profile?.avatar || ''}
                onChange={handleChange}
                icon={FaImage}
              />
              <FormField
                label="Resume URL"
                name="resume"
                value={profile?.resume || ''}
                onChange={handleChange}
                icon={FaFileAlt}
              />
            </div>
            <div className="admin-form__row">
              <FileUploader
                label="Upload Avatar"
                accept="image/*"
                buttonText="Upload Avatar"
                uploadContext="avatar"
                helpText="Images only. Auto-saves after upload."
                onUploaded={(url) => { persistUploadedAsset('avatar', url); }}
              />
              <FileUploader
                label="Upload Resume"
                accept=".pdf,application/pdf"
                buttonText="Upload Resume"
                uploadContext="resume"
                helpText="PDF only. Auto-saves after upload."
                onUploaded={(url) => { persistUploadedAsset('resume', url); }}
              />
            </div>
            {profile?.avatar && (
              <div className="admin-avatar-preview">
                <img src={profile.avatar} alt="Avatar preview" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
              </div>
            )}
          </section>

          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-social" className="admin-profile-anchor" />
            <h3 className="admin-profile-section__title">
              <FaLinkedin /> Social Links
            </h3>
            <p className="admin-profile-section__intro">
              Connect the profiles you want visible on the public site and contact areas.
            </p>
            <div className="admin-profile-section__meta">
              <span className={`chip ${connectedSocialLinks.length > 0 ? 'chip-active' : ''}`}>
                {connectedSocialLinks.length} connected
              </span>
            </div>
            <div className="admin-form__row">
              <FormField
                label="Website URL"
                name="website_url"
                value={profile?.website_url || ''}
                onChange={handleChange}
                icon={FaGlobe}
              />
              <FormField
                label="GitHub URL"
                name="github_url"
                value={profile?.github_url || ''}
                onChange={handleChange}
                icon={FaGithub}
              />
            </div>
            <div className="admin-form__row">
              <FormField
                label="LinkedIn URL"
                name="linkedin_url"
                value={profile?.linkedin_url || ''}
                onChange={handleChange}
                icon={FaLinkedin}
              />
              <FormField
                label="Twitter URL"
                name="twitter_url"
                value={profile?.twitter_url || ''}
                onChange={handleChange}
                icon={FaTwitter}
              />
            </div>
          </section>
          </>
          )}

          {activeViewMode === 'visibility' && (
          <>
          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-section-controls" className="admin-profile-anchor" />
            <div className="admin-profile-section__header">
              <div>
                <h3 className="admin-profile-section__title">
                  <FaProjectDiagram /> Public Section Controls
                </h3>
                <p className="admin-profile-section__hint">
                  Only sections with content appear here. Past {VISIBILITY_HINT_LIMIT} visible sections, the portfolio can start to feel heavy.
                </p>
              </div>
              <div className="admin-profile-section__actions">
                <span className="chip chip-active">{visibleSectionCount} visible</span>
                <span className="chip">{hiddenSectionCount} hidden</span>
                {unavailableSectionOptions.length > 0 && <span className="chip">{unavailableSectionOptions.length} unavailable</span>}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setVisibilityGroup(availableSectionOptions, true)}
                  disabled={availableSectionOptions.length === 0}
                >
                  Show All
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setVisibilityGroup(availableSectionOptions, false)}
                  disabled={availableSectionOptions.length === 0}
                >
                  Hide All
                </button>
              </div>
            </div>
            {sectionLimitExceeded && (
              <div className="admin-profile-callout admin-profile-callout--warning">
                <strong>{visibleSectionCount} sections are enabled</strong>
                <p>
                  Crossing {VISIBILITY_HINT_LIMIT} visible sections can make the portfolio feel crowded. Keep the strongest sections on and hide the rest.
                </p>
              </div>
            )}
            {unavailableSectionOptions.length > 0 && (
              <div className="admin-profile-callout">
                <strong>Hidden until content exists</strong>
                <p>Add content to these sections first, then they will appear here for toggling.</p>
                <div className="admin-profile-callout__chips">
                  {unavailableSectionOptions.map((option) => (
                    <span key={option.key} className="chip">{option.label}</span>
                  ))}
                </div>
              </div>
            )}
            {availableSectionOptions.length > 0 ? (
              <div className="admin-visibility-list">
                {availableSectionOptions.map((option) => (
                  <VisibilityToggleCard
                    key={option.key}
                    option={option}
                    checked={profile?.[option.key] !== false}
                    onChange={handleChange}
                  />
                ))}
              </div>
            ) : (
              <div className="admin-profile-callout">
                <strong>No content-backed public sections yet</strong>
                <p>Add skills, projects, education, articles, or testimonials to unlock more section controls here.</p>
              </div>
            )}
          </section>

          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-navbar-controls" className="admin-profile-anchor" />
            <div className="admin-profile-section__header">
              <div>
                <h3 className="admin-profile-section__title">
                  <FaLayerGroup /> Navbar Controls
                </h3>
                <p className="admin-profile-section__hint">
                  Only content-backed sections appear here. Past {VISIBILITY_HINT_LIMIT} active links, the navbar can feel congested.
                </p>
              </div>
              <div className="admin-profile-section__actions">
                <span className="chip chip-active">{visibleNavCount} visible</span>
                <span className="chip">{hiddenNavCount} hidden</span>
                {unavailableNavOptions.length > 0 && <span className="chip">{unavailableNavOptions.length} unavailable</span>}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setVisibilityGroup(availableNavOptions, true)}
                  disabled={availableNavOptions.length === 0}
                >
                  Show All
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setVisibilityGroup(availableNavOptions, false)}
                  disabled={availableNavOptions.length === 0}
                >
                  Hide All
                </button>
              </div>
            </div>
            {navLimitExceeded && (
              <div className="admin-profile-callout admin-profile-callout--warning">
                <strong>{visibleNavCount} navbar links are active</strong>
                <p>
                  Crossing {VISIBILITY_HINT_LIMIT} links can make the navbar feel congested. Keep only the sections that matter most for fast scanning.
                </p>
              </div>
            )}
            {unavailableNavOptions.length > 0 && (
              <div className="admin-profile-callout">
                <strong>Missing content hides navbar toggles too</strong>
                <p>These links will appear here after their matching public sections have real content.</p>
                <div className="admin-profile-callout__chips">
                  {unavailableNavOptions.map((option) => (
                    <span key={option.key} className="chip">{option.label}</span>
                  ))}
                </div>
              </div>
            )}
            {availableNavOptions.length > 0 ? (
              <div className="admin-visibility-list">
                {availableNavOptions.map((option) => (
                  <VisibilityToggleCard
                    key={option.key}
                    option={option}
                    checked={profile?.[option.key] !== false}
                    onChange={handleChange}
                    note={
                      profile?.[NAV_OPTION_SECTION_MAP[option.key]] === false
                        ? 'Enable the matching public section to surface this link.'
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="admin-profile-callout">
                <strong>No content-backed navbar links yet</strong>
                <p>Add public content first, then the matching navbar controls will show up here.</p>
              </div>
            )}
          </section>
          </>
          )}
        </div>

        <div className="admin-profile-submit">
          <div className="admin-profile-submit__meta">
            <strong>{hasUnsavedChanges ? 'Unsaved changes' : 'Profile is up to date'}</strong>
            <span>
              {hasUnsavedChanges
                ? 'Review the sections above, then save when you are ready.'
                : 'No pending edits in the current profile form.'}
            </span>
          </div>
          <div className="admin-profile-submit__actions">
            <button
              type="button"
              className="btn btn-outline btn-lg admin-profile-submit__btn admin-profile-submit__btn--secondary"
              onClick={handleResetChanges}
              disabled={!hasUnsavedChanges || isBusy}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg admin-profile-submit__btn admin-profile-submit__btn--primary"
              disabled={isBusy}
            >
              <FaSave /> {isSubmitting || isSavingAsset ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </Motion.form>
      )}
    </div>
  );
}
