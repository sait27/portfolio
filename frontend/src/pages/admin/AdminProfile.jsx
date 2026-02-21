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

const filledCount = (profile) =>
  PROFILE_KEYS.filter((key) => {
    const value = profile?.[key];
    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  }).length;

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    userApi.getProfile()
      .then((response) => setProfile({ ...DEFAULT_SECTION_VISIBILITY, ...DEFAULT_NAV_VISIBILITY, ...response.data }))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProfile((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await userApi.updateProfile(profile);
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
            {profile?.resume && <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="chip">Resume</a>}
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
            {profile?.avatar && (
              <div className="admin-avatar-preview">
                <img src={profile.avatar} alt="Avatar preview" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
              </div>
            )}
          </section>

          <section className="admin-profile-section admin-profile-section--half">
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
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
            <FaSave /> {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </Motion.form>
    </div>
  );
}
