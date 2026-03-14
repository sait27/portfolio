import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus,
  FaRocket, FaBlog, FaCertificate,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const FEATURES = [
  {
    icon: <FaRocket />,
    color: 'orange',
    title: 'Launch in Minutes',
    desc: 'Set up a polished portfolio with zero coding — publish instantly.',
  },
  {
    icon: <FaBlog />,
    color: 'cyan',
    title: 'Built-in Blog',
    desc: 'Write, draft, and publish articles to grow your authority online.',
  },
  {
    icon: <FaCertificate />,
    color: 'pink',
    title: 'Career Milestones',
    desc: 'Highlight education, certifications, achievements & activities.',
  },
];

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', full_name: '', password: '', password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/user/dashboard" replace />;
  }

  const updateField = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    else if (form.username.length < 3) newErrors.username = 'Must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) newErrors.username = 'Only letters, numbers, hyphens, underscores';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Must be at least 8 characters';
    if (form.password !== form.password_confirm) newErrors.password_confirm = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/user/dashboard', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const serverErrors = {};
        Object.entries(data).forEach(([key, value]) => {
          serverErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(serverErrors);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account | PortfolioHub</title>
      </Helmet>

      <main id="main-content" className="auth-page auth-page--register">
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
              Start building your{' '}
              <span className="gradient-text">professional brand.</span>
            </h2>
            <p className="auth-showcase__desc">
              Join PortfolioHub and create a portfolio that recruiters, clients,
              and collaborators will remember. Everything you need, in one platform.
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
                <strong>∞</strong>
                <span>Projects</span>
              </div>
              <div className="auth-showcase__stat auth-showcase__stat--cyan">
                <strong>Blog</strong>
                <span>Built in</span>
              </div>
              <div className="auth-showcase__stat auth-showcase__stat--pink">
                <strong>Free</strong>
                <span>Forever</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right: Registration Form ── */}
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
                <FaUserPlus />
              </div>
              <h1>Create Account</h1>
              <p>Start building your portfolio in minutes</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Row 1: Username + Full Name */}
              <div className="auth-form__row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-username">Username</label>
                  <div className="auth-input-wrapper">
                    <FaUser className="auth-input-icon" />
                    <input
                      id="reg-username"
                      type="text"
                      className="form-input auth-input"
                      placeholder="e.g., johndoe"
                      value={form.username}
                      onChange={updateField('username')}
                      autoFocus
                    />
                  </div>
                  {errors.username && <span className="auth-field-error">{errors.username}</span>}
                  {form.username && !errors.username && (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      portfoliohub.com/<strong>{form.username.toLowerCase()}</strong>
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-fullname">Full Name</label>
                  <div className="auth-input-wrapper">
                    <FaUser className="auth-input-icon" />
                    <input
                      id="reg-fullname"
                      type="text"
                      className="form-input auth-input"
                      placeholder="John Doe"
                      value={form.full_name}
                      onChange={updateField('full_name')}
                    />
                  </div>
                  {errors.full_name && <span className="auth-field-error">{errors.full_name}</span>}
                </div>
              </div>

              {/* Email — full width */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <div className="auth-input-wrapper">
                  <FaEnvelope className="auth-input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input auth-input"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={updateField('email')}
                  />
                </div>
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>

              {/* Row 2: Password + Confirm */}
              <div className="auth-form__row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Password</label>
                  <div className="auth-input-wrapper">
                    <FaLock className="auth-input-icon" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input auth-input"
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={updateField('password')}
                    />
                    <button
                      type="button"
                      className="auth-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="password-strength">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`password-strength__bar ${strength >= level ? 'active' : ''} ${strength >= 3 ? 'strong' : strength >= 2 ? 'medium' : ''}`}
                        />
                      ))}
                    </div>
                  )}
                  {errors.password && <span className="auth-field-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <FaLock className="auth-input-icon" />
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input auth-input"
                      placeholder="Re-enter password"
                      value={form.password_confirm}
                      onChange={updateField('password_confirm')}
                    />
                  </div>
                  {errors.password_confirm && <span className="auth-field-error">{errors.password_confirm}</span>}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
