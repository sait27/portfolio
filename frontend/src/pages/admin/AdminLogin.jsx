import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaLock, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/FormField';
import './AdminLogin.css';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/user/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.username, formData.password);
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
        <title>Admin Login | Portfolio</title>
      </Helmet>
      <div className="admin-login">
        <motion.div
          className="admin-login__card glass"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="admin-login__header">
            <div className="admin-login__icon">
              <FaLock />
            </div>
            <h1>Admin Login</h1>
            <p>Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login__form">
            <FormField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              icon={FaUser}
              placeholder="Enter username"
              required
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              icon={FaLock}
              placeholder="Enter password"
              required
            />

            <button
              type="submit"
              className="btn btn-primary btn-lg admin-login__submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
