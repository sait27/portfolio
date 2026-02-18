import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if tokens exist on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      // Try to fetch admin profile to verify token is valid
      adminApi.getDashboard()
        .then(() => {
          setIsAuthenticated(true);
          setUser({ role: 'admin' });
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await adminApi.login({ username, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setIsAuthenticated(true);
    setUser({ role: 'admin' });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
