import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaUser, FaEnvelope, FaBriefcase, FaFileAlt, FaImage, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    userApi.getProfile()
      .then(res => setProfile(res.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userApi.updateProfile(profile);
      toast.success('Profile updated!');
    } catch (err) {
      const errors = err.response?.data;
      const msg = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : 'Failed to update profile';
      toast.error(msg);
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
    <div>
      <div className="admin-page-header">
        <h1>Profile</h1>
        <p>Edit your personal information</p>
      </div>

      <motion.form
        className="admin-profile-form glass"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '2.5rem', maxWidth: '800px' }}
      >
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
          hint="e.g., Full-Stack Python Developer"
        />

        <FormField
          label="Bio"
          name="bio"
          type="textarea"
          value={profile?.bio || ''}
          onChange={handleChange}
          icon={FaFileAlt}
          rows={5}
          hint="Tell the world about yourself..."
        />

        <div className="admin-form__row">
          <FormField
            label="Avatar URL"
            name="avatar"
            value={profile?.avatar || ''}
            onChange={handleChange}
            icon={FaImage}
            hint="Cloudinary URL"
          />
          <FormField
            label="Resume URL"
            name="resume"
            value={profile?.resume || ''}
            onChange={handleChange}
            icon={FaFileAlt}
            hint="Cloudinary URL"
          />
        </div>

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

        <motion.button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isSubmitting}
          style={{ marginTop: '1.5rem', width: '100%' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaSave /> {isSubmitting ? 'Saving...' : 'Save Profile'}
        </motion.button>
      </motion.form>
    </div>
  );
}
