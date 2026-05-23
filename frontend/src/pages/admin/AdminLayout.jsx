import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaBlog,
  FaBriefcase,
  FaCertificate,
  FaCode,
  FaCompass,
  FaEnvelope,
  FaExternalLinkAlt,
  FaPaperPlane,
  FaProjectDiagram,
  FaQuoteLeft,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
  FaUser,
  FaUserShield,
} from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import { useImpersonation } from '../../hooks/useImpersonation';
import './AdminLayout.css';

const SIDEBAR_LINKS = [
  {
    label: 'Dashboard',
    path: '/user/dashboard',
    icon: <FaTachometerAlt />,
  },
  {
    label: 'Projects',
    path: '/user/projects',
    icon: <FaProjectDiagram />,
  },
  {
    label: 'Publish',
    path: '/user/publish',
    icon: <FaPaperPlane />,
  },
  {
    label: 'Blog',
    path: '/user/blog',
    icon: <FaBlog />,
  },
  {
    label: 'Testimonials',
    path: '/user/testimonials',
    icon: <FaQuoteLeft />,
  },
  {
    label: 'Skills',
    path: '/user/skills',
    icon: <FaCode />,
  },
  {
    label: 'Experience',
    path: '/user/experience',
    icon: <FaBriefcase />,
  },
  {
    label: 'Milestones',
    path: '/user/milestones',
    icon: <FaCertificate />,
  },
  {
    label: 'Messages',
    path: '/user/messages',
    icon: <FaEnvelope />,
  },
  {
    label: 'Profile',
    path: '/user/profile',
    icon: <FaUser />,
  },
];

const ADMIN_ONLY_LINKS = [
  {
    label: 'Admin Panel',
    path: '/admin/dashboard',
    icon: <FaUserShield />,
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { isImpersonating } = useImpersonation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdminPortal = location.pathname.startsWith('/admin');
  const username = user?.username || user?.username_slug || '';
  const isPlatformAdmin = Boolean(user?.is_platform_admin);

  const primaryLinks = isAdminPortal ? ADMIN_ONLY_LINKS : SIDEBAR_LINKS;
  const secondaryLinks = !isAdminPortal && isPlatformAdmin ? ADMIN_ONLY_LINKS : [];

  useEffect(() => {
    if (!isSidebarOpen) return undefined;
    const timeoutId = window.setTimeout(() => setIsSidebarOpen(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isSidebarOpen, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`admin-layout admin-shell ${isImpersonating ? 'impersonation-active' : ''}`}>
      <button
        type="button"
        className={`admin-shell__scrim ${isSidebarOpen ? 'admin-shell__scrim--visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
        tabIndex={isSidebarOpen ? 0 : -1}
      />

      <aside className={`admin-sidebar ${isSidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brand-mark">
            {isAdminPortal ? <FaUserShield /> : <FaCompass />}
          </div>
          <div className={`admin-sidebar__brand-copy ${isAdminPortal ? 'admin-sidebar__brand-copy--portal' : ''}`}>
            <span className="admin-sidebar__eyebrow">
              {isAdminPortal ? 'Platform Admin' : 'Portfolio Builder'}
            </span>
            <strong className="admin-sidebar__brand-title">
              {isAdminPortal ? 'Admin Portal' : user?.full_name || 'User Portal'}
            </strong>
            {username && <small>@{username}</small>}
          </div>
          <button
            type="button"
            className="admin-sidebar__close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <FaTimes />
          </button>
        </div>

        <div className="admin-sidebar__section">
          <div className="admin-sidebar__section-label">Workspace</div>
          <nav className="admin-sidebar__nav" aria-label="Primary navigation">
            {primaryLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                }
              >
                <span className="admin-sidebar__icon">{link.icon}</span>
                <span className="admin-sidebar__copy">
                  <strong>{link.label}</strong>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar__footer">
          {username && !isAdminPortal && (
            <NavLink to={`/${username}`} className="admin-sidebar__utility">
              <FaExternalLinkAlt />
              <span>View Portfolio</span>
            </NavLink>
          )}
          {isAdminPortal && (
            <NavLink to="/user/dashboard" className="admin-sidebar__utility">
              <FaTachometerAlt />
              <span>User Dashboard</span>
            </NavLink>
          )}
          {!isAdminPortal && secondaryLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className="admin-sidebar__utility">
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar__utility admin-sidebar__utility--logout"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-shell__content">
        <button
          type="button"
          className="admin-shell__mobile-toggle"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <FaBars />
        </button>

        <main id="main-content" className="admin-main">
          <div className="admin-main__frame">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
