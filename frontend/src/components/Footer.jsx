import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user, isAuthenticated } = useAuth();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <img src="/favicon.svg" alt="Logo" className="footer__logo-icon" />
              <span className="gradient-text">Portfolio</span>
            </Link>
            <p className="footer__tagline">
              Building digital experiences with passion and precision.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer__nav">
            <h4 className="footer__heading">Quick Links</h4>
            <ul className="footer__links">
              <li><Link to="/">Home</Link></li>
              {isAuthenticated && user?.username && (
                <li><Link to={`/${user.username}`}>My Portfolio</Link></li>
              )}
              {isAuthenticated && (
                <li><Link to="/user/dashboard">Dashboard</Link></li>
              )}
              {!isAuthenticated && (
                <>
                  <li><Link to="/user/login">Sign In</Link></li>
                  <li><Link to="/register">Get Started</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Social */}
          <div className="footer__social">
            <h4 className="footer__heading">Platform</h4>
            <p className="footer__tagline" style={{ marginTop: '0.5rem' }}>
              PortfolioHub — Build your developer brand in minutes.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p>
            &copy; {currentYear} PortfolioHub. Made with{' '}
            <FaHeart className="footer__heart" /> and lots of coffee.
          </p>
        </div>
      </div>
    </footer>
  );
}
