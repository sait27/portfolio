import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaHeart } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
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
              <li><Link to="/about">About</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="footer__social">
            <h4 className="footer__heading">Connect</h4>
            <div className="footer__social-links">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p>
            &copy; {currentYear} Portfolio. Made with{' '}
            <FaHeart className="footer__heart" /> and lots of coffee.
          </p>
        </div>
      </div>
    </footer>
  );
}
