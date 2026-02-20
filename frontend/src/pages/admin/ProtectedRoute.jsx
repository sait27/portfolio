import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSkeleton from '../../components/LoadingSkeleton';

/**
 * Protects user and admin routes. Redirects to login if not authenticated.
 * For admin routes, also checks if user is platform admin.
 */
export default function ProtectedRoute({ children, requirePlatformAdmin = false }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSkeleton variant="title" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check platform admin requirement for admin portal
  if (requirePlatformAdmin && !user?.is_platform_admin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
}
