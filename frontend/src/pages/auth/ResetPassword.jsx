import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authApi } from '../../api/client';
import './Auth.css';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ uid, token, new_password: password });
      setDone(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Reset link is invalid or expired. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | PortfolioHub</title>
      </Helmet>
      <div className="auth-page">
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

          {done ? (
            <motion.div
              className="auth-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="auth-success-icon">
                <FaCheckCircle />
              </div>
              <h2>Password Reset!</h2>
              <p>Your password has been updated successfully. You can now sign in with your new password.</p>
              <Link to="/login" className="btn btn-primary btn-lg auth-submit">
                Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="auth-header" style={{ marginTop: 0 }}>
                <div className="auth-icon">
                  <FaLock />
                </div>
                <h1>Set New Password</h1>
                <p>Enter your new password below</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="rp-password">New Password</label>
                  <div className="auth-input-wrapper">
                    <FaLock className="auth-input-icon" />
                    <input
                      id="rp-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input auth-input"
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="auth-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rp-confirm">Confirm New Password</label>
                  <div className="auth-input-wrapper">
                    <FaLock className="auth-input-icon" />
                    <input
                      id="rp-confirm"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input auth-input"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    />
                  </div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="auth-footer">
                <Link to="/login">Back to Sign In</Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
