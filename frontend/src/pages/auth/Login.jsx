import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FaLock, FaUser, FaEye, FaEyeSlash,
  FaProjectDiagram, FaChartLine, FaShieldAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const FEATURES = [
  {
    icon: <FaProjectDiagram />,
    color: 'orange',
    title: 'Stunning Portfolios',
    desc: 'Showcase projects, skills & experience with a beautiful public page.',
  },
  {
    icon: <FaChartLine />,
    color: 'cyan',
    title: 'Smart Dashboard',
    desc: 'Track content health, inbox leads, and publishing metrics at a glance.',
  },
  {
    icon: <FaShieldAlt />,
    color: 'pink',
    title: 'Complete Control',
    desc: 'Manage visibility, SEO, and integrations — your brand, your rules.',
  },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/user/dashboard" replace />;
  }

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (field === 'username') {
      if (!value.trim()) newErrors.username = 'Username is required';
      else delete newErrors.username;
    }
    if (field === 'password') {
      if (!value.trim()) newErrors.password = 'Password is required';
      else if (value.length < 6) newErrors.password = 'Password must be at least 6 characters';
      else delete newErrors.password;
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password.trim()) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/user/dashboard', { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(detail || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In | PortfolioHub</title>
      </Helmet>

      <main id="main-content" className="auth-page">
        {/* ── Left: Showcase Panel ── */}
        <div className="auth-showcase">
          <div className="auth-showcase__orb auth-showcase__orb--1" />
          <div className="auth-showcase__orb auth-showcase__orb--2" />
          <div className="auth-showcase__orb auth-showcase__orb--3" />

          <motion.div
            className="auth-showcase__content"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="auth-showcase__logo">
              <span className="gradient-text">PortfolioHub</span>
            </Link>

            <h2 className="auth-showcase__tagline">
              Your professional story,{' '}
              <span className="gradient-text">beautifully told.</span>
            </h2>
            <p className="auth-showcase__desc">
              Build a portfolio that stands out. Manage projects, blog posts,
              testimonials, and career milestones — all from one powerful dashboard.
            </p>

            <div className="auth-showcase__features">
              {FEATURES.map((f) => (
                <div key={f.title} className="auth-showcase__feature">
                  <div className={`auth-showcase__feature-icon auth-showcase__feature-icon--${f.color}`}>
                    {f.icon}
                  </div>
                  <div className="auth-showcase__feature-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="auth-showcase__stats">
              <div className="auth-showcase__stat auth-showcase__stat--orange">
                <strong>100%</strong>
                <span>Free to use</span>
              </div>
              <div className="auth-showcase__stat auth-showcase__stat--cyan">
                <strong>10+</strong>
                <span>Content sections</span>
              </div>
              <div className="auth-showcase__stat auth-showcase__stat--pink">
                <strong>SEO</strong>
                <span>Optimized</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right: Sign-In Form ── */}
        <div className="auth-panel">
          <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Link to="/" className="auth-mobile-logo">
              <span className="gradient-text">PortfolioHub</span>
            </Link>

            <div className="auth-header">
              <div className="auth-icon">
                <FaLock />
              </div>
              <h1>Welcome Back</h1>
              <p>Sign in to your portfolio dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-username">Username</label>
                <div className="auth-input-wrapper">
                  <FaUser className="auth-input-icon" />
                  <input
                    id="login-username"
                    type="text"
                    className={`form-input auth-input ${errors.username ? 'form-input--error' : ''}`}
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      validateField('username', e.target.value);
                    }}
                    onBlur={(e) => validateField('username', e.target.value)}
                    autoFocus
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                  />
                </div>
                {errors.username && <span id="username-error" className="form-error" role="alert">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <div className="auth-input-wrapper">
                  <FaLock className="auth-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input auth-input ${errors.password ? 'form-input--error' : ''}`}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validateField('password', e.target.value);
                    }}
                    onBlur={(e) => validateField('password', e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="auth-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span id="password-error" className="form-error" role="alert">{errors.password}</span>}
              </div>

              <div className="auth-forgot-link">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register">Create one free</Link>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
