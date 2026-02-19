import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt, FaProjectDiagram, FaEnvelope, FaTachometerAlt, FaSignOutAlt, FaUser, FaCode, FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Projects', path: '/admin/projects', icon: <FaProjectDiagram /> },
  { label: 'Skills', path: '/admin/skills', icon: <FaCode /> },
  { label: 'Experience', path: '/admin/experience', icon: <FaBriefcase /> },
  { label: 'Messages', path: '/admin/messages', icon: <FaEnvelope /> },
  { label: 'Profile', path: '/admin/profile', icon: <FaUser /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const username = user?.username || user?.username_slug || '';

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <span className="gradient-text">{user?.full_name || 'Dashboard'}</span>
          {username && (
            <span className="admin-sidebar__username">@{username}</span>
          )}
        </div>

        <nav className="admin-sidebar__nav">
          {SIDEBAR_LINKS.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          {username && (
            <NavLink to={`/${username}`} className="admin-sidebar__link">
              <FaExternalLinkAlt />
              <span>My Portfolio</span>
            </NavLink>
          )}
          <button onClick={handleLogout} className="admin-sidebar__link admin-sidebar__logout">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
