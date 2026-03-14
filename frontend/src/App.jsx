import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ScrollProgress from './components/ScrollProgress';
import ImpersonationBanner from './components/ImpersonationBanner';

// Public / Marketing
import Landing from './pages/Landing';
import PublicPortfolio from './pages/PublicPortfolio';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// User Dashboard Pages
import UserLayout from './pages/admin/AdminLayout';
import UserDashboard from './pages/admin/AdminDashboard';
import UserProjects from './pages/admin/AdminProjects';
import AdminBlog from './pages/admin/AdminBlog';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import UserSkills from './pages/admin/AdminSkills';
import UserExperience from './pages/admin/AdminExperience';
import AdminMilestones from './pages/admin/AdminMilestones';
import UserMessages from './pages/admin/AdminMessages';
import UserProfile from './pages/admin/AdminProfile';
import AdminPanel from './pages/admin/SuperAdminPanel';
import ProtectedRoute from './pages/admin/ProtectedRoute';

// User Dashboard CSS
import './pages/admin/AdminComponents.css';

/**
 * Redirects old marketing portfolio routes to the logged-in user's
 * public portfolio, or to the landing page if not authenticated.
 */
function PortfolioRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated && user?.username) {
    return <Navigate to={`/${user.username}`} replace />;
  }
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <a href="#main-content" className="skip-to-content">Skip to content</a>
            <ImpersonationBanner />
            <ScrollToTop />
            <ScrollProgress />

            <Routes>
              {/* Marketing */}
              <Route path="/" element={<Landing />} />

              {/* Redirect old marketing portfolio routes to user's portfolio */}
              <Route path="/about" element={<PortfolioRedirect />} />
              <Route path="/projects" element={<PortfolioRedirect />} />
              <Route path="/contact" element={<PortfolioRedirect />} />
              <Route path="/blog" element={<PortfolioRedirect />} />
              <Route path="/blog/:slug" element={<PortfolioRedirect />} />
              <Route path="/testimonials" element={<PortfolioRedirect />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

              {/* User Dashboard (protected) */}
              <Route path="/user/login" element={<Login />} />
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="projects" element={<UserProjects />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="skills" element={<UserSkills />} />
                <Route path="experience" element={<UserExperience />} />
                <Route path="milestones" element={<AdminMilestones />} />
                <Route path="messages" element={<UserMessages />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>

              {/* Platform admin */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requirePlatformAdmin={true}>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminPanel />} />
              </Route>

              {/* Public portfolio */}
              <Route path="/:username" element={<PublicPortfolio />} />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#16161f',
                  color: '#f0f0f5',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
