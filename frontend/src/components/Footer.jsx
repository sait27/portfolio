import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaHeart } from 'react-icons/fa';
import { HiDownload } from 'react-icons/hi';
import { publicApi } from '../api/client';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    publicApi.getProfile().then(res => setProfile(res.data)).catch(() => {});
  }, []);

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
              {profile?.tagline || 'Building digital experiences with passion and precision.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer__nav">
            <h4 className="footer__heading">Quick Links</h4>
            <ul className="footer__links">
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              {profile?.resume && (
                <li>
                  <a href={profile.resume} target="_blank" rel="noopener noreferrer">
                    <HiDownload /> Resume
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Social */}
          <div className="footer__social">
            <h4 className="footer__heading">Connect</h4>
            <div className="footer__social-links">
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <FaGithub size={20} />
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FaLinkedin size={20} />
                </a>
              )}
              {profile?.twitter_url && (
                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FaTwitter size={20} />
                </a>
              )}
            </div>
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="footer__email">
                {profile.email}
              </a>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p>
            &copy; {currentYear} {profile?.full_name || 'Portfolio'}. Made with{' '}
            <FaHeart className="footer__heart" /> and lots of coffee.
          </p>
        </div>
      </div>
    </footer>
  );
}
