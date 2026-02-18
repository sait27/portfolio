import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaProjectDiagram, FaEnvelope, FaTachometerAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Projects', path: '/admin/projects', icon: <FaProjectDiagram /> },
  { label: 'Messages', path: '/admin/messages', icon: <FaEnvelope /> },
  { label: 'Profile', path: '/admin/profile', icon: <FaUser /> },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <span className="gradient-text">Admin</span>
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
          <NavLink to="/" className="admin-sidebar__link">
            <FaHome />
            <span>View Site</span>
          </NavLink>
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
