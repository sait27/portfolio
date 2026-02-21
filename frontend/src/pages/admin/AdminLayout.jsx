import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaExternalLinkAlt, FaProjectDiagram, FaEnvelope, FaTachometerAlt, FaSignOutAlt, FaUser, FaCode, FaBriefcase, FaUserShield, FaBlog, FaQuoteLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useImpersonation } from '../../hooks/useImpersonation';
import './AdminLayout.css';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/user/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Projects', path: '/user/projects', icon: <FaProjectDiagram /> },
  { label: 'Blog', path: '/user/blog', icon: <FaBlog /> },
  { label: 'Testimonials', path: '/user/testimonials', icon: <FaQuoteLeft /> },
  { label: 'Skills', path: '/user/skills', icon: <FaCode /> },
  { label: 'Experience', path: '/user/experience', icon: <FaBriefcase /> },
  { label: 'Messages', path: '/user/messages', icon: <FaEnvelope /> },
  { label: 'Profile', path: '/user/profile', icon: <FaUser /> },
];

const ADMIN_ONLY_LINKS = [
  { label: 'Admin Panel', path: '/admin/dashboard', icon: <FaUserShield /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { isImpersonating } = useImpersonation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPortal = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const username = user?.username || user?.username_slug || '';

  // Show different sidebar based on portal type
  const sidebarLinks = isAdminPortal ? [] : SIDEBAR_LINKS;
  const showAdminLinks = !isAdminPortal && user?.is_platform_admin;

  return (
    <div className={`admin-layout ${isImpersonating ? 'impersonation-active' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <span className="gradient-text">
            {isAdminPortal ? 'Admin Portal' : (user?.full_name || 'User Portal')}
          </span>
          {username && !isAdminPortal && (
            <span className="admin-sidebar__username">@{username}</span>
          )}
        </div>

        <nav className="admin-sidebar__nav">
          {sidebarLinks.map(link => (
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

          {/* Admin Panel link — only for platform admins in user portal */}
          {showAdminLinks && (
            <>
              <div style={{ borderTop: '1px solid var(--border-glass)', margin: '0.5rem 0' }} />
              {ADMIN_ONLY_LINKS.map(link => (
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
            </>
          )}
        </nav>

        <div className="admin-sidebar__footer">
          {username && !isAdminPortal && (
            <NavLink to={`/${username}`} className="admin-sidebar__link">
              <FaExternalLinkAlt />
              <span>My Portfolio</span>
            </NavLink>
          )}
          {!isAdminPortal && (
            <NavLink to="/user/dashboard" className="admin-sidebar__link">
              <FaTachometerAlt />
              <span>User Portal</span>
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
