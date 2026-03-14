import { useEffect, useMemo, useState } from 'react';
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
  FaGraduationCap,
  FaHome,
  FaImage,
  FaInfoCircle,
  FaLinkedin,
  FaLayerGroup,
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
  'tagline',
  'bio',
  'avatar',
  'resume',
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

const PROFILE_SECTION_LINKS = [
  { id: 'profile-basics', label: 'Basics', icon: FaUser },
  { id: 'profile-about', label: 'About', icon: FaInfoCircle },
  { id: 'profile-assets', label: 'Assets', icon: FaImage },
  { id: 'profile-social', label: 'Social', icon: FaLinkedin },
  { id: 'profile-section-controls', label: 'Sections', icon: FaProjectDiagram },
  { id: 'profile-navbar-controls', label: 'Navbar', icon: FaLayerGroup },
];

const filledCount = (profile) =>
  PROFILE_KEYS.filter((key) => {
    const value = profile?.[key];
    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  }).length;

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [savedProfileSnapshot, setSavedProfileSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [isSavingResumeExtract, setIsSavingResumeExtract] = useState(false);
  const [overwriteExtractOnSave, setOverwriteExtractOnSave] = useState(false);
  const [resumePreview, setResumePreview] = useState(null);
  const resumeUrl = profile?.resume_download_url || profile?.resume || '';

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
    userApi.getProfile()
      .then((response) => {
        const merged = { ...DEFAULT_SECTION_VISIBILITY, ...DEFAULT_NAV_VISIBILITY, ...response.data };
        setProfile(merged);
        setSavedProfileSnapshot(merged);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
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

  const completion = useMemo(() => {
    const count = filledCount(profile);
    return {
      count,
      total: PROFILE_KEYS.length,
      percent: Math.round((count / PROFILE_KEYS.length) * 100) || 0,
    };
  }, [profile]);

  const visibleSectionCount = useMemo(
    () => SECTION_VISIBILITY_OPTIONS.filter((option) => profile?.[option.key] !== false).length,
    [profile]
  );
  const visibleNavCount = useMemo(
    () => NAV_VISIBILITY_OPTIONS.filter((option) => profile?.[option.key] !== false).length,
    [profile]
  );
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

      <div className="admin-profile-tools glass">
        <div className="admin-profile-tools__links">
          {PROFILE_SECTION_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.id} href={`#${item.id}`} className="chip">
                <Icon />
                {item.label}
              </a>
            );
          })}
        </div>
        <div className="admin-profile-tools__state">
          <span className={`chip ${hasUnsavedChanges ? '' : 'chip-active'}`}>
            {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
          </span>
          {hasUnsavedChanges && (
            <button type="button" className="btn btn-outline btn-sm" onClick={handleResetChanges}>
              Reset Changes
            </button>
          )}
        </div>
      </div>

      <section className="admin-resume-extract glass">
        <div className="admin-resume-extract__header">
          <div>
            <p className="admin-dashboard__eyebrow">Resume Extraction</p>
            <h2 className="admin-dashboard__headline">Preview Before Save</h2>
            <p className="admin-dashboard__subtext">
              Extracted data stays temporary until you click Save Extracted Data.
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
              disabled={!resumePreview || isExtractingResume || isSavingResumeExtract}
            >
              <FaSave /> {isSavingResumeExtract ? 'Saving Extract...' : 'Save Extracted Data'}
            </button>
          </div>
        </div>

        {!profile?.resume && (
          <p className="admin-profile-section__hint">Upload a resume in Assets first to enable extraction.</p>
        )}

        {resumePreview && (
          <div className="admin-resume-extract__preview">
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

      <div className="admin-profile-summary glass">
        <div>
          <p className="admin-dashboard__eyebrow">Profile Completion</p>
          <h2 className="admin-dashboard__headline">{completion.percent}% complete</h2>
          <p className="admin-dashboard__subtext">
            {completion.count}/{completion.total} profile sections filled.
          </p>
        </div>
        <div className="admin-profile-summary__meter">
          <div className="admin-profile-summary__meter-track">
            <div style={{ width: `${completion.percent}%` }} />
          </div>
          <div className="admin-profile-summary__links">
            {profile?.avatar && <a href={profile.avatar} target="_blank" rel="noopener noreferrer" className="chip">Avatar</a>}
            {resumeUrl && <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="chip">Resume</a>}
            <span className="chip chip-active">{visibleSectionCount}/{SECTION_VISIBILITY_OPTIONS.length} sections visible</span>
            <span className="chip chip-active">{visibleNavCount}/{NAV_VISIBILITY_OPTIONS.length} nav links visible</span>
          </div>
        </div>
      </div>

      <Motion.form
        className="admin-profile-form glass"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="admin-profile-grid">
          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-basics" className="admin-profile-anchor" />
            <h3 className="admin-profile-section__title">
              <FaUser /> Basics
            </h3>
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
            <FormField
              label="Tagline"
              name="tagline"
              value={profile?.tagline || ''}
              onChange={handleChange}
              icon={FaBriefcase}
              hint="Example: Full-Stack Python Developer"
            />
          </section>

          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-about" className="admin-profile-anchor" />
            <h3 className="admin-profile-section__title">
              <FaInfoCircle /> About
            </h3>
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
                helpText="PDF only. Max size: 10MB. Auto-saves after upload."
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
            <div className="admin-form__row">
              <FormField
                label="GitHub URL"
                name="github_url"
                value={profile?.github_url || ''}
                onChange={handleChange}
                icon={FaGithub}
              />
              <FormField
                label="LinkedIn URL"
                name="linkedin_url"
                value={profile?.linkedin_url || ''}
                onChange={handleChange}
                icon={FaLinkedin}
              />
            </div>
            <FormField
              label="Twitter URL"
              name="twitter_url"
              value={profile?.twitter_url || ''}
              onChange={handleChange}
              icon={FaTwitter}
            />
          </section>

          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-section-controls" className="admin-profile-anchor" />
            <h3 className="admin-profile-section__title">
              <FaProjectDiagram /> Public Section Controls
            </h3>
            <p className="admin-profile-section__hint">
              Toggle what appears on your public portfolio page.
            </p>
            <div className="admin-visibility-grid">
              {SECTION_VISIBILITY_OPTIONS.map((option) => (
                <div
                  key={option.key}
                  className={`admin-visibility-item ${profile?.[option.key] !== false ? 'admin-visibility-item--active' : ''}`}
                >
                  <FormField
                    label={option.label}
                    name={option.key}
                    type="checkbox"
                    value={profile?.[option.key] !== false}
                    onChange={handleChange}
                    icon={option.icon}
                  />
                  <p>{option.hint}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-profile-section admin-profile-section--half">
            <div id="profile-navbar-controls" className="admin-profile-anchor" />
            <h3 className="admin-profile-section__title">
              <FaLayerGroup /> Navbar Controls
            </h3>
            <p className="admin-profile-section__hint">
              Choose exactly which sections appear in the portfolio navbar.
            </p>
            <div className="admin-visibility-grid">
              {NAV_VISIBILITY_OPTIONS.map((option) => (
                <div
                  key={option.key}
                  className={`admin-visibility-item ${profile?.[option.key] !== false ? 'admin-visibility-item--active' : ''}`}
                >
                  <FormField
                    label={option.label}
                    name={option.key}
                    type="checkbox"
                    value={profile?.[option.key] !== false}
                    onChange={handleChange}
                    icon={option.icon}
                  />
                  <p>{option.hint}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="admin-profile-submit">
          <button
            type="button"
            className="btn btn-outline btn-lg"
            onClick={handleResetChanges}
            disabled={!hasUnsavedChanges || isSubmitting || isSavingAsset || isExtractingResume || isSavingResumeExtract}
          >
            Reset
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting || isSavingAsset || isExtractingResume || isSavingResumeExtract}>
            <FaSave /> {isSubmitting || isSavingAsset ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </Motion.form>
    </div>
  );
}
