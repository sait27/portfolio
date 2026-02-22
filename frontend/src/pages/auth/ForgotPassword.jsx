import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authApi } from '../../api/client';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | PortfolioHub</title>
      </Helmet>
      <main id="main-content" className="auth-page">
        <motion.div
          className="auth-card glass"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              PortfolioHub
            </Link>
          </div>

          {sent ? (
            <motion.div
              className="auth-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="auth-success-icon">
                <FaCheckCircle />
              </div>
              <h2>Check your email</h2>
              <p>
                If an account with <strong>{email}</strong> exists, we've sent a password reset link.
                Check your inbox (and spam folder).
              </p>
              <Link to="/login" className="btn btn-primary btn-lg auth-submit">
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="auth-header" style={{ marginTop: 0 }}>
                <div className="auth-icon">
                  <FaEnvelope />
                </div>
                <h1>Forgot Password?</h1>
                <p>Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="fp-email">Email Address</label>
                  <div className="auth-input-wrapper">
                    <FaEnvelope className="auth-input-icon" />
                    <input
                      id="fp-email"
                      type="email"
                      className="form-input auth-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="auth-footer">
                Remember your password?{' '}
                <Link to="/login">Sign in</Link>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </>
  );
}
