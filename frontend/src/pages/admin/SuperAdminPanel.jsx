import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaProjectDiagram, FaCode, FaEnvelope, FaUserShield, FaToggleOn, FaToggleOff, FaTrash, FaExternalLinkAlt, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { superAdminApi } from '../../api/client';
import '../admin/AdminComponents.css';

export default function SuperAdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        superAdminApi.getStats(),
        superAdminApi.getUsers(),
      ]);
      setStats(statsRes.data);
      const userData = usersRes.data.results || usersRes.data;
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await superAdminApi.toggleUser(userId, !currentActive);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u));
      toast.success(currentActive ? 'User deactivated' : 'User activated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await superAdminApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setConfirmDelete(null);
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="admin-page-header">
          <h1><FaUserShield style={{ marginRight: '0.5rem' }} /> Super Admin</h1>
          <p>Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="admin-page-header">
        <h1><FaUserShield style={{ marginRight: '0.5rem', color: 'var(--accent-primary)' }} /> Super Admin Panel</h1>
        <p>Platform overview and user management</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <motion.div
          className="admin-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
        >
          <div className="admin-stat">
            <div className="admin-stat__label"><FaUsers style={{ marginRight: '0.35rem' }} /> Total Users</div>
            <div className="admin-stat__value admin-stat__value--accent">{stats.total_users}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat__label"><FaChartLine style={{ marginRight: '0.35rem' }} /> Recent Signups</div>
            <div className="admin-stat__value admin-stat__value--cyan">{stats.recent_signups}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Last 30 days</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat__label"><FaProjectDiagram style={{ marginRight: '0.35rem' }} /> Projects</div>
            <div className="admin-stat__value admin-stat__value--pink">{stats.total_projects}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat__label"><FaCode style={{ marginRight: '0.35rem' }} /> Skills</div>
            <div className="admin-stat__value">{stats.total_skills}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat__label"><FaEnvelope style={{ marginRight: '0.35rem' }} /> Messages</div>
            <div className="admin-stat__value">{stats.total_messages}</div>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      <motion.div
        className="glass"
        style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
            All Users <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({users.length})</span>
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Projects</th>
                <th>Skills</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.full_name || user.username}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td><span className="chip">{user.projects_count}</span></td>
                  <td><span className="chip">{user.skills_count}</span></td>
                  <td>
                    <span className="chip" style={{
                      background: user.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: user.is_active ? '#22c55e' : '#ef4444',
                      border: `1px solid ${user.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>
                      {user.is_active ? 'Active' : 'Disabled'}
                    </span>
                    {user.is_platform_admin && (
                      <span className="chip" style={{ marginLeft: '0.35rem', background: 'rgba(124,58,237,0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(124,58,237,0.3)' }}>
                        Admin
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <a
                        href={`/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn--edit"
                        title="View Portfolio"
                      >
                        <FaExternalLinkAlt />
                      </a>
                      {!user.is_platform_admin && (
                        <>
                          <button
                            className="admin-btn admin-btn--edit"
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          {confirmDelete === user.id ? (
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(user.id)} style={{ fontSize: 'var(--font-size-xs)' }}>
                                Confirm
                              </button>
                              <button className="admin-btn admin-btn--edit" onClick={() => setConfirmDelete(null)} style={{ fontSize: 'var(--font-size-xs)' }}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="admin-btn admin-btn--delete"
                              onClick={() => setConfirmDelete(user.id)}
                              title="Delete User"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
