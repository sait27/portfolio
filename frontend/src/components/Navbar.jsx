import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '../context/useAuth';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const NAV_LINKS = [
    { label: 'Home', path: '/' },
    ...(isAuthenticated && user?.username
      ? [{ label: 'My Portfolio', path: `/${user.username}` }]
      : []),
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Motion.nav
      className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar__container container">
        <Link to="/" className="navbar__logo">
          <img src="/favicon.svg" alt="Logo" className="navbar__logo-icon" />
          <span className="gradient-text">Portfolio</span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <Motion.div
                    className="navbar__indicator"
                    layoutId="navbar-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="navbar__right">
          {isAuthenticated ? (
            <Link to="/user/dashboard" className="btn btn-primary btn-sm navbar__cta">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/user/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm navbar__cta">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="navbar__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="navbar-mobile-menu"
        >
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            id="navbar-mobile-menu"
            className="navbar__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ul className="navbar__mobile-links">
              {NAV_LINKS.map((link, i) => (
                <Motion.li
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`navbar__mobile-link ${location.pathname === link.path ? 'navbar__mobile-link--active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </Motion.li>
              ))}
              <Motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isAuthenticated ? (
                  <Link
                    to="/user/dashboard"
                    className="navbar__mobile-link"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/user/login"
                    className="navbar__mobile-link"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </Motion.li>
            </ul>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.nav>
  );
}
