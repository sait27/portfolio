import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  FaUsers, FaProjectDiagram, FaCode, FaEnvelope,
  FaUserShield, FaToggleOn, FaToggleOff, FaTrash,
  FaExternalLinkAlt, FaChartLine, FaUserSecret,
  FaSearch, FaBriefcase, FaHistory, FaCog,
  FaFileExport, FaCheckSquare, FaSquare, FaTimes,
  FaRocket, FaBlog, FaCertificate, FaGraduationCap,
  FaTrophy, FaRunning, FaComments, FaChartBar,
  FaChevronRight, FaGithub, FaLinkedin,
  FaGlobe,
  FaPhone,
  FaDownload, FaSave, FaCheck,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/client';
import '../admin/AdminComponents.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
  { id: 'users', label: 'Users', icon: <FaUsers /> },
  { id: 'analytics', label: 'Analytics', icon: <FaChartBar /> },
  { id: 'activity', label: 'Activity', icon: <FaHistory /> },
  { id: 'settings', label: 'Settings', icon: <FaCog /> },
];

const ACTIVITY_ICONS = {
  signup: <FaUsers />,
  project: <FaProjectDiagram />,
  blog: <FaBlog />,
  message: <FaEnvelope />,
  experience: <FaBriefcase />,
};

const ACTIVITY_COLORS = {
  signup: 'cyan',
  project: 'accent',
  blog: 'pink',
  message: 'accent',
  experience: 'cyan',
};

export default function SuperAdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [impersonating, setImpersonating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [drawerUser, setDrawerUser] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Lazy load tab-specific data
  useEffect(() => {
    if (activeTab === 'analytics' && !analytics) {
      adminApi.getAnalytics().then(r => setAnalytics(r.data)).catch(() => toast.error('Failed to load analytics'));
    }
    if (activeTab === 'activity' && activities.length === 0) {
      adminApi.getActivity(50).then(r => setActivities(r.data)).catch(() => toast.error('Failed to load activity'));
    }
    if (activeTab === 'settings' && !settings) {
      adminApi.getSettings().then(r => setSettings(r.data)).catch(() => toast.error('Failed to load settings'));
    }
  }, [activeTab, analytics, activities.length, settings]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !term || [user.username, user.email, user.full_name]
        .filter(Boolean).some((v) => v.toLowerCase().includes(term));
      const isPlatformAdmin = Boolean(user.is_platform_admin);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active) ||
        (statusFilter === 'admin' && isPlatformAdmin);
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(d);
  };

  // --- Handlers ---
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
      setSelectedUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleImpersonate = async (userId) => {
    try {
      setImpersonating(userId);
      const response = await adminApi.impersonateUser(userId);
      localStorage.setItem('original_admin_id', response.data.original_admin_id);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      toast.success(`Now impersonating ${response.data.impersonated_user.username}`);
      window.location.href = '/user/dashboard';
    } catch (err) {
      setImpersonating(null);
      toast.error(err.response?.data?.detail || 'Failed to impersonate user');
    }
  };

  const handleBulkAction = async (action) => {
    const ids = Array.from(selectedUsers);
    if (ids.length === 0) return toast.error('No users selected');
    try {
      const res = await adminApi.bulkAction(ids, action);
      toast.success(res.data.detail);
      setSelectedUsers(new Set());
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Bulk action failed');
    }
  };

  const handleExport = () => {
    const token = localStorage.getItem('access_token');
    const url = adminApi.exportUsersUrl();
    const a = document.createElement('a');
    // Use fetch for auth header
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const link = URL.createObjectURL(blob);
        a.href = link;
        a.download = 'platform_users.csv';
        a.click();
        URL.revokeObjectURL(link);
        toast.success('Users exported!');
      })
      .catch(() => toast.error('Export failed'));
  };

  const openDrawer = async (userId) => {
    setDrawerLoading(true);
    setDrawerUser(null);
    try {
      const res = await adminApi.getUser(userId);
      setDrawerUser(res.data);
    } catch {
      toast.error('Failed to load user details');
    } finally {
      setDrawerLoading(false);
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.filter(u => !u.is_platform_admin).length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.filter(u => !u.is_platform_admin).map(u => u.id)));
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await adminApi.updateSettings(settings);
      setSettings(res.data);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  // --- Computed ---
  const totalUsers = stats?.total_users || users.length || 0;
  const activeUsers = stats?.active_users || users.filter(u => u.is_active).length;
  const activeRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const overviewCards = [
    { label: 'Total Users', value: totalUsers, hint: `${activeUsers} active`, icon: <FaUsers />, color: 'accent' },
    { label: 'Recent Signups', value: stats?.recent_signups || 0, hint: 'Last 30 days', icon: <FaChartLine />, color: 'cyan' },
    { label: 'Projects', value: stats?.total_projects || 0, hint: 'Across all users', icon: <FaProjectDiagram />, color: 'pink' },
    { label: 'Skills', value: stats?.total_skills || 0, hint: `${stats?.total_categories || 0} categories`, icon: <FaCode />, color: 'accent' },
    { label: 'Experience', value: stats?.total_experience || 0, hint: 'Career entries', icon: <FaBriefcase />, color: 'cyan' },
    { label: 'Messages', value: stats?.total_messages || 0, hint: 'Lead pipeline', icon: <FaEnvelope />, color: 'pink' },
  ];

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-page-header"><h1><FaUserShield /> Admin Panel</h1><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-page-header admin-panel__header">
        <h1><FaUserShield /> Admin Panel</h1>
        <p>Platform management, analytics, and user controls.</p>
      </div>

      {/* ── Tab Nav ── */}
      <div className="sa-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`sa-tab ${activeTab === tab.id ? 'sa-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Overview ── */}
      {activeTab === 'overview' && (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="admin-panel__summary glass">
            <div>
              <p className="admin-dashboard__eyebrow">Platform Health</p>
              <h2 className="admin-dashboard__headline">{activeRate}% active users</h2>
              <p className="admin-dashboard__subtext">{activeUsers} active out of {totalUsers} total accounts.</p>
            </div>
            <div className="admin-panel__summary-chips">
              <span className="chip">Admins: {users.filter(u => u.is_platform_admin).length}</span>
              <span className="chip">Blogs: {stats?.total_blogs || 0}</span>
              <span className="chip">Testimonials: {stats?.total_testimonials || 0}</span>
            </div>
          </div>

          <Motion.div className="admin-stats admin-panel__stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {overviewCards.map((card, i) => (
              <Motion.div key={card.label} className="admin-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="admin-stat__label">
                  <span className={`admin-stat__icon admin-stat__icon--${card.color}`}>{card.icon}</span>{card.label}
                </div>
                <div className={`admin-stat__value admin-stat__value--${card.color}`}>{card.value}</div>
                <div className="admin-panel__stat-hint">{card.hint}</div>
              </Motion.div>
            ))}
          </Motion.div>
        </Motion.div>
      )}

      {/* ── TAB: Users ── */}
      {activeTab === 'users' && (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Bulk action bar */}
          {selectedUsers.size > 0 && (
            <div className="sa-bulk-bar glass">
              <span><strong>{selectedUsers.size}</strong> user(s) selected</span>
              <div className="sa-bulk-bar__actions">
                <button className="btn btn-sm btn-outline" onClick={() => handleBulkAction('activate')}><FaToggleOn /> Activate</button>
                <button className="btn btn-sm btn-outline" onClick={() => handleBulkAction('deactivate')}><FaToggleOff /> Deactivate</button>
                <button className="btn btn-sm btn-outline sa-btn--danger" onClick={() => handleBulkAction('delete')}><FaTrash /> Delete</button>
                <button className="btn btn-sm btn-outline" onClick={() => setSelectedUsers(new Set())}><FaTimes /> Clear</button>
              </div>
            </div>
          )}

          <div className="admin-panel__table-card glass">
            <div className="admin-panel__table-header">
              <h2>User Directory <span>({filteredUsers.length})</span></h2>
              <div className="admin-panel__controls">
                <label className="admin-panel__search">
                  <FaSearch />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." aria-label="Search users" />
                </label>
                <select className="form-input admin-panel__filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter">
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="admin">Admins</option>
                </select>
                <button className="btn btn-sm btn-outline" onClick={handleExport} title="Export CSV"><FaDownload /> Export</button>
              </div>
            </div>

            <div className="admin-panel__table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <button className="sa-checkbox-btn" onClick={toggleSelectAll} title="Select all">
                        {selectedUsers.size > 0 && selectedUsers.size === filteredUsers.filter(u => !u.is_platform_admin).length
                          ? <FaCheckSquare /> : <FaSquare />}
                      </button>
                    </th>
                    <th>User</th><th>Email</th><th>Joined</th><th>Projects</th><th>Skills</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className={selectedUsers.has(user.id) ? 'sa-row--selected' : ''}>
                      <td>
                        {!user.is_platform_admin && (
                          <button className="sa-checkbox-btn" onClick={() => toggleSelectUser(user.id)}>
                            {selectedUsers.has(user.id) ? <FaCheckSquare /> : <FaSquare />}
                          </button>
                        )}
                      </td>
                      <td>
                        <button className="admin-user-cell sa-user-link" onClick={() => openDrawer(user.id)} type="button">
                          <div className="admin-user-cell__avatar">{user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="admin-user-cell__name">{user.full_name || user.username}</div>
                            <div className="admin-user-cell__username">@{user.username}</div>
                          </div>
                        </button>
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
                          {user.is_platform_admin && <span className="chip chip-status-admin">Admin</span>}
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <a href={`/${user.username}`} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--edit" title="View Portfolio"><FaExternalLinkAlt /></a>
                          {!user.is_platform_admin && (
                            <>
                              <button className="admin-btn admin-btn--edit" onClick={() => handleImpersonate(user.id)} disabled={impersonating === user.id} title="Impersonate">
                                {impersonating === user.id ? '...' : <FaUserSecret />}
                              </button>
                              <button className="admin-btn admin-btn--edit" onClick={() => handleToggleActive(user.id, user.is_active)} title={user.is_active ? 'Deactivate' : 'Activate'}>
                                {user.is_active ? <FaToggleOn /> : <FaToggleOff />}
                              </button>
                              {confirmDelete === user.id ? (
                                <div className="admin-actions admin-actions--confirm">
                                  <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(user.id)}>Confirm</button>
                                  <button className="admin-btn admin-btn--edit" onClick={() => setConfirmDelete(null)}>Cancel</button>
                                </div>
                              ) : (
                                <button className="admin-btn admin-btn--delete" onClick={() => setConfirmDelete(user.id)} title="Delete"><FaTrash /></button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="admin-panel__empty"><p>No users match the current filters.</p></div>}
            </div>
          </div>
        </Motion.div>
      )}

      {/* ── TAB: Analytics ── */}
      {activeTab === 'analytics' && (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {!analytics ? (
            <div className="admin-panel__empty"><p>Loading analytics...</p></div>
          ) : (
            <>
              {/* Signups chart */}
              <div className="sa-chart-card glass">
                <h3><FaChartLine /> User Signups (Last 12 Months)</h3>
                <div className="sa-bar-chart">
                  {analytics.signups_by_month.map(item => {
                    const max = Math.max(...analytics.signups_by_month.map(i => i.count), 1);
                    return (
                      <div key={item.month} className="sa-bar-col">
                        <span className="sa-bar-val">{item.count}</span>
                        <div className="sa-bar" style={{ height: `${(item.count / max) * 100}%` }} />
                        <span className="sa-bar-label">{item.month.slice(5)}</span>
                      </div>
                    );
                  })}
                  {analytics.signups_by_month.length === 0 && <p className="sa-chart-empty">No signup data yet</p>}
                </div>
              </div>

              {/* Content distribution */}
              <div className="sa-chart-card glass">
                <h3><FaChartBar /> Content Distribution</h3>
                <div className="sa-content-grid">
                  {Object.entries(analytics.content_distribution).map(([key, count]) => {
                    const icons = {
                      projects: <FaProjectDiagram />, skills: <FaCode />, blog_posts: <FaBlog />,
                      experience: <FaBriefcase />, testimonials: <FaComments />, education: <FaGraduationCap />,
                      certifications: <FaCertificate />, achievements: <FaTrophy />, activities: <FaRunning />,
                      messages: <FaEnvelope />,
                    };
                    return (
                      <div key={key} className="sa-content-item glass">
                        <div className="sa-content-item__icon">{icons[key] || <FaCode />}</div>
                        <div className="sa-content-item__value">{count}</div>
                        <div className="sa-content-item__label">{key.replace(/_/g, ' ')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Users */}
              <div className="sa-chart-card glass">
                <h3><FaTrophy /> Top Contributors</h3>
                <div className="sa-top-users">
                  {analytics.top_users.map((u, i) => (
                    <div key={u.username} className="sa-top-user">
                      <span className="sa-top-user__rank">#{i + 1}</span>
                      <div className="sa-top-user__info">
                        <strong>{u.full_name || u.username}</strong>
                        <span>@{u.username}</span>
                      </div>
                      <span className="chip">{u.total_content} items</span>
                    </div>
                  ))}
                  {analytics.top_users.length === 0 && <p>No data yet</p>}
                </div>
              </div>
            </>
          )}
        </Motion.div>
      )}

      {/* ── TAB: Activity ── */}
      {activeTab === 'activity' && (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="sa-chart-card glass">
            <h3><FaHistory /> Recent Activity</h3>
            <div className="sa-activity-list">
              {activities.map((item, i) => (
                <div key={i} className="sa-activity-item">
                  <div className={`sa-activity-icon sa-activity-icon--${ACTIVITY_COLORS[item.type] || 'accent'}`}>
                    {ACTIVITY_ICONS[item.type] || <FaHistory />}
                  </div>
                  <div className="sa-activity-content">
                    <p>{item.message}</p>
                    <span className="sa-activity-time">{timeAgo(item.timestamp)}</span>
                  </div>
                </div>
              ))}
              {activities.length === 0 && <p className="admin-panel__empty">No recent activity.</p>}
            </div>
          </div>
        </Motion.div>
      )}

      {/* ── TAB: Settings ── */}
      {activeTab === 'settings' && (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {!settings ? (
            <div className="admin-panel__empty"><p>Loading settings...</p></div>
          ) : (
            <div className="sa-settings-card glass">
              <h3><FaCog /> Platform Settings</h3>

              <div className="sa-settings-grid">
                <div className="sa-setting">
                  <label>Platform Name</label>
                  <input className="form-input" value={settings.platform_name || ''} onChange={e => setSettings({ ...settings, platform_name: e.target.value })} />
                </div>
                <div className="sa-setting">
                  <label>Max Upload Size (MB)</label>
                  <input className="form-input" type="number" value={settings.max_upload_size_mb || 10} onChange={e => setSettings({ ...settings, max_upload_size_mb: parseInt(e.target.value) || 10 })} />
                </div>
                <div className="sa-setting">
                  <label>Max Projects Per User</label>
                  <input className="form-input" type="number" value={settings.max_projects_per_user || 50} onChange={e => setSettings({ ...settings, max_projects_per_user: parseInt(e.target.value) || 50 })} />
                </div>
                <div className="sa-setting">
                  <label>Max Blogs Per User</label>
                  <input className="form-input" type="number" value={settings.max_blogs_per_user || 100} onChange={e => setSettings({ ...settings, max_blogs_per_user: parseInt(e.target.value) || 100 })} />
                </div>

                <div className="sa-setting sa-setting--toggle">
                  <label>Allow Registration</label>
                  <button className={`sa-toggle ${settings.allow_registration ? 'sa-toggle--on' : ''}`} onClick={() => setSettings({ ...settings, allow_registration: !settings.allow_registration })}>
                    {settings.allow_registration ? <FaToggleOn /> : <FaToggleOff />}
                    <span>{settings.allow_registration ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
                <div className="sa-setting sa-setting--toggle">
                  <label>Public Profiles</label>
                  <button className={`sa-toggle ${settings.allow_public_profiles ? 'sa-toggle--on' : ''}`} onClick={() => setSettings({ ...settings, allow_public_profiles: !settings.allow_public_profiles })}>
                    {settings.allow_public_profiles ? <FaToggleOn /> : <FaToggleOff />}
                    <span>{settings.allow_public_profiles ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
                <div className="sa-setting sa-setting--toggle">
                  <label>Maintenance Mode</label>
                  <button className={`sa-toggle ${settings.maintenance_mode ? 'sa-toggle--on sa-toggle--danger' : ''}`} onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}>
                    {settings.maintenance_mode ? <FaToggleOn /> : <FaToggleOff />}
                    <span>{settings.maintenance_mode ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleSaveSettings} disabled={settingsSaving} style={{ marginTop: '1.5rem' }}>
                {settingsSaving ? <><span className="spinner" /> Saving...</> : <><FaSave /> Save Settings</>}
              </button>
            </div>
          )}
        </Motion.div>
      )}

      {/* ── User Detail Drawer ── */}
      {(drawerUser || drawerLoading) && (
        <div className="sa-drawer-overlay" onClick={() => { setDrawerUser(null); setDrawerLoading(false); }}>
          <Motion.div
            className="sa-drawer glass"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="sa-drawer__close" onClick={() => { setDrawerUser(null); setDrawerLoading(false); }}><FaTimes /></button>

            {drawerLoading ? (
              <div className="sa-drawer__loading">Loading user details...</div>
            ) : drawerUser && (
              <>
                <div className="sa-drawer__header">
                  <div className="sa-drawer__avatar">
                    {drawerUser.avatar
                      ? <img src={drawerUser.avatar} alt="" />
                      : <span>{drawerUser.full_name?.charAt(0) || drawerUser.username.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <h2>{drawerUser.full_name || drawerUser.username}</h2>
                  <p className="sa-drawer__username">@{drawerUser.username}</p>
                  {drawerUser.tagline && <p className="sa-drawer__tagline">{drawerUser.tagline}</p>}
                </div>

                <div className="sa-drawer__meta">
                  <div><strong>Email</strong><span>{drawerUser.email}</span></div>
                  <div><strong>Phone</strong><span>{drawerUser.phone || 'Not provided'}</span></div>
                  <div><strong>Joined</strong><span>{formatDate(drawerUser.date_joined)}</span></div>
                  <div><strong>Last Login</strong><span>{drawerUser.last_login ? timeAgo(drawerUser.last_login) : 'Never'}</span></div>
                  <div><strong>Status</strong><span className={`chip ${drawerUser.is_active ? 'chip-status-active' : 'chip-status-inactive'}`}>{drawerUser.is_active ? 'Active' : 'Disabled'}</span></div>
                </div>

                {(drawerUser.website_url || drawerUser.github_url || drawerUser.linkedin_url || drawerUser.phone) && (
                  <div className="sa-drawer__links">
                    {drawerUser.phone && <a href={`tel:${drawerUser.phone}`}><FaPhone /> Phone</a>}
                    {drawerUser.website_url && <a href={drawerUser.website_url} target="_blank" rel="noopener noreferrer"><FaGlobe /> Website</a>}
                    {drawerUser.github_url && <a href={drawerUser.github_url} target="_blank" rel="noopener noreferrer"><FaGithub /> GitHub</a>}
                    {drawerUser.linkedin_url && <a href={drawerUser.linkedin_url} target="_blank" rel="noopener noreferrer"><FaLinkedin /> LinkedIn</a>}
                  </div>
                )}

                <h3 className="sa-drawer__section-title">Content Stats</h3>
                <div className="sa-drawer__stats-grid">
                  {[
                    { label: 'Projects', value: drawerUser.projects_count, icon: <FaProjectDiagram /> },
                    { label: 'Skills', value: drawerUser.skills_count, icon: <FaCode /> },
                    { label: 'Experience', value: drawerUser.experience_count, icon: <FaBriefcase /> },
                    { label: 'Blog Posts', value: drawerUser.blog_count, icon: <FaBlog /> },
                    { label: 'Messages', value: drawerUser.messages_count, icon: <FaEnvelope /> },
                    { label: 'Testimonials', value: drawerUser.testimonials_count, icon: <FaComments /> },
                    { label: 'Education', value: drawerUser.education_count, icon: <FaGraduationCap /> },
                    { label: 'Certifications', value: drawerUser.certifications_count, icon: <FaCertificate /> },
                  ].map(s => (
                    <div key={s.label} className="sa-drawer__stat">
                      <span className="sa-drawer__stat-icon">{s.icon}</span>
                      <span className="sa-drawer__stat-val">{s.value}</span>
                      <span className="sa-drawer__stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="sa-drawer__actions">
                  <a href={`/${drawerUser.username}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><FaExternalLinkAlt /> View Portfolio</a>
                  {!drawerUser.is_platform_admin && (
                    <button className="btn btn-outline btn-sm" onClick={() => { handleImpersonate(drawerUser.id); setDrawerUser(null); }}><FaUserSecret /> Impersonate</button>
                  )}
                </div>
              </>
            )}
          </Motion.div>
        </div>
      )}
    </div>
  );
}
