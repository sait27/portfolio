import { useState, useEffect, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  FaUsers,
  FaProjectDiagram,
  FaCode,
  FaEnvelope,
  FaUserShield,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
  FaExternalLinkAlt,
  FaChartLine,
  FaUserSecret,
  FaSearch,
  FaBriefcase,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import '../admin/AdminComponents.css';

export default function SuperAdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [impersonating, setImpersonating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user: currentUser } = useAuth();

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
      ]);
      setStats(statsRes.data);
      const userData = usersRes.data.results || usersRes.data;
      setUsers(Array.isArray(userData) ? userData : []);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !term || [
        user.username,
        user.email,
        user.full_name,
      ].filter(Boolean).some((value) => value.toLowerCase().includes(term));

      const isPlatformAdmin = Boolean(user.is_platform_admin);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active) ||
        (statusFilter === 'admin' && isPlatformAdmin);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await adminApi.toggleUser(userId, !currentActive);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u));
      toast.success(currentActive ? 'User deactivated' : 'User activated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await adminApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setConfirmDelete(null);
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleImpersonate = async (userId) => {
    try {
      setImpersonating(userId);
      const response = await adminApi.impersonateUser(userId);
      
      // Store original admin info and new tokens
      localStorage.setItem('original_admin_id', response.data.original_admin_id);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      toast.success(`Now impersonating ${response.data.impersonated_user.username}`);
      
      // Redirect to user dashboard
      window.location.href = '/user/dashboard';
    } catch (err) {
      setImpersonating(null);
      toast.error(err.response?.data?.detail || 'Failed to impersonate user');
    }
  };

  const totalUsers = stats?.total_users || users.length || 0;
  const activeUsers = stats?.active_users || users.filter((item) => item.is_active).length;
  const activeRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const overviewCards = [
    {
      label: 'Total Users',
      value: totalUsers,
      hint: `${activeUsers} active accounts`,
      icon: <FaUsers />,
      color: 'accent',
    },
    {
      label: 'Recent Signups',
      value: stats?.recent_signups || 0,
      hint: 'Last 30 days',
      icon: <FaChartLine />,
      color: 'cyan',
    },
    {
      label: 'Portfolio Projects',
      value: stats?.total_projects || 0,
      hint: 'Across all users',
      icon: <FaProjectDiagram />,
      color: 'pink',
    },
    {
      label: 'Skills Added',
      value: stats?.total_skills || 0,
      hint: `${stats?.total_categories || 0} categories`,
      icon: <FaCode />,
      color: 'accent',
    },
    {
      label: 'Experience Entries',
      value: stats?.total_experience || 0,
      hint: 'Career timelines tracked',
      icon: <FaBriefcase />,
      color: 'cyan',
    },
    {
      label: 'Contact Messages',
      value: stats?.total_messages || 0,
      hint: 'Lead pipeline',
      icon: <FaEnvelope />,
      color: 'pink',
    },
  ];

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-page-header">
          <h1><FaUserShield /> Admin Panel</h1>
          <p>Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-page-header admin-panel__header">
        <h1><FaUserShield /> Admin Panel</h1>
        <p>Platform overview, user lifecycle, and account controls.</p>
      </div>

      <div className="admin-panel__summary glass">
        <div>
          <p className="admin-dashboard__eyebrow">Platform Health</p>
          <h2 className="admin-dashboard__headline">{activeRate}% of users are active</h2>
          <p className="admin-dashboard__subtext">
            {activeUsers} active out of {totalUsers} total accounts.
          </p>
        </div>
        <div className="admin-panel__summary-chips">
          <span className="chip">Filtered Users: {filteredUsers.length}</span>
          <span className="chip">Platform Admins: {users.filter((u) => u.is_platform_admin).length}</span>
          <span className="chip">Your Role: {currentUser?.is_platform_admin ? 'Super Admin' : 'User'}</span>
        </div>
      </div>

      {stats && (
        <Motion.div
          className="admin-stats admin-panel__stats"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {overviewCards.map((card, index) => (
            <Motion.div
              key={card.label}
              className="admin-stat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <div className="admin-stat__label">
                <span className={`admin-stat__icon admin-stat__icon--${card.color}`}>{card.icon}</span>
                {card.label}
              </div>
              <div className={`admin-stat__value admin-stat__value--${card.color}`}>{card.value}</div>
              <div className="admin-panel__stat-hint">{card.hint}</div>
            </Motion.div>
          ))}
        </Motion.div>
      )}

      <Motion.div
        className="admin-panel__table-card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="admin-panel__table-header">
          <h2>
            User Directory <span>({filteredUsers.length})</span>
          </h2>
          <div className="admin-panel__controls">
            <label className="admin-panel__search">
              <FaSearch />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, username, or email"
                aria-label="Search users"
              />
            </label>
            <select
              className="form-input admin-panel__filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="admin-panel__table-wrap">
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
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-cell__avatar">
                        {user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="admin-user-cell__name">{user.full_name || user.username}</div>
                        <div className="admin-user-cell__username">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.date_joined)}</td>
                  <td><span className="chip">{user.projects_count}</span></td>
                  <td><span className="chip">{user.skills_count}</span></td>
                  <td>
                    <div className="admin-status-chips">
                      <span className={`chip ${user.is_active ? 'chip-status-active' : 'chip-status-inactive'}`}>
                        {user.is_active ? 'Active' : 'Disabled'}
                      </span>
                      {user.is_platform_admin && (
                        <span className="chip chip-status-admin">
                          Admin
                        </span>
                      )}
                    </div>
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
                            onClick={() => handleImpersonate(user.id)}
                            disabled={impersonating === user.id}
                            type="button"
                            title="Impersonate User"
                          >
                            {impersonating === user.id ? '...' : <FaUserSecret />}
                          </button>
                          <button
                            className="admin-btn admin-btn--edit"
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            type="button"
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          {confirmDelete === user.id ? (
                            <div className="admin-actions admin-actions--confirm">
                              <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(user.id)} type="button">
                                Confirm
                              </button>
                              <button className="admin-btn admin-btn--edit" onClick={() => setConfirmDelete(null)} type="button">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="admin-btn admin-btn--delete"
                              onClick={() => setConfirmDelete(user.id)}
                              type="button"
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
          {filteredUsers.length === 0 && (
            <div className="admin-panel__empty">
              <p>No users found for the current search/filter.</p>
            </div>
          )}
        </div>
      </Motion.div>
    </div>
  );
}
