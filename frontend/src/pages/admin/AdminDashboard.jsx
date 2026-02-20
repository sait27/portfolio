import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaProjectDiagram, FaEnvelope, FaCode, FaBriefcase } from 'react-icons/fa';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Projects', value: stats.projects, color: 'accent', icon: <FaProjectDiagram /> },
    { label: 'Featured', value: stats.featured_projects, color: 'cyan', icon: <FaProjectDiagram /> },
    { label: 'Total Skills', value: stats.skills, color: 'accent', icon: <FaCode /> },
    { label: 'Categories', value: stats.categories, color: 'cyan', icon: <FaCode /> },
    { label: 'Experience', value: stats.experience, color: 'pink', icon: <FaBriefcase /> },
    { label: 'Total Messages', value: stats.messages, color: 'accent', icon: <FaEnvelope /> },
    { label: 'Unread Messages', value: stats.unread_messages, color: 'pink', icon: <FaEnvelope /> },
  ] : [];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Overview of your portfolio</p>
      </div>

      {loading ? (
        <div className="admin-stats">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="admin-stat">
              <LoadingSkeleton variant="text" />
              <LoadingSkeleton variant="title" />
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-stats">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              className="admin-stat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="admin-stat__label">{card.label}</div>
              <div className={`admin-stat__value admin-stat__value--${card.color}`}>
                {card.value}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="admin-page-header" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Quick Actions</h2>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/user/projects" className="btn btn-primary btn-sm">
          <FaProjectDiagram /> Manage Projects
        </Link>
        <Link to="/user/messages" className="btn btn-outline btn-sm">
          <FaEnvelope /> View Messages
        </Link>
        <Link to="/user/profile" className="btn btn-outline btn-sm">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
