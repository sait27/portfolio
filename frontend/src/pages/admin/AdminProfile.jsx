import { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { FaEnvelope, FaFileAlt, FaGithub, FaImage, FaLinkedin, FaSave, FaTwitter, FaUser, FaBriefcase } from 'react-icons/fa';
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
      .then((response) => setProfile(response.data))
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
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
          </div>
        </div>
      </div>

      <Motion.form
        className="admin-profile-form glass"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <section className="admin-profile-section">
          <h3>Basics</h3>
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

        <section className="admin-profile-section">
          <h3>About</h3>
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

        <section className="admin-profile-section">
          <h3>Assets</h3>
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

        <section className="admin-profile-section">
          <h3>Social Links</h3>
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

        <div className="admin-profile-submit">
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
            <FaSave /> {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </Motion.form>
    </div>
  );
}
