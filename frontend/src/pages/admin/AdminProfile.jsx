import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';

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
        style={{ padding: '2rem', maxWidth: '700px' }}
      >
        <div className="admin-form__row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="full_name" className="form-input" value={profile?.full_name || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" value={profile?.email || ''} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tagline</label>
          <input name="tagline" className="form-input" value={profile?.tagline || ''} onChange={handleChange} placeholder="e.g., Full-Stack Python Developer" />
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea name="bio" className="form-textarea" value={profile?.bio || ''} onChange={handleChange} rows={5} placeholder="Tell the world about yourself..." />
        </div>

        <div className="admin-form__row">
          <div className="form-group">
            <label className="form-label">Avatar URL</label>
            <input name="avatar" className="form-input" value={profile?.avatar || ''} onChange={handleChange} placeholder="Cloudinary URL" />
          </div>
          <div className="form-group">
            <label className="form-label">Resume URL</label>
            <input name="resume" className="form-input" value={profile?.resume || ''} onChange={handleChange} placeholder="Cloudinary URL" />
          </div>
        </div>

        <div className="admin-form__row">
          <div className="form-group">
            <label className="form-label">GitHub URL</label>
            <input name="github_url" className="form-input" value={profile?.github_url || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">LinkedIn URL</label>
            <input name="linkedin_url" className="form-input" value={profile?.linkedin_url || ''} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Twitter URL</label>
          <input name="twitter_url" className="form-input" value={profile?.twitter_url || ''} onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: '1rem' }}>
          <FaSave /> {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </motion.form>
    </div>
  );
}
