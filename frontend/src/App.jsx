import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import ScrollToTop from './components/ScrollToTop';

// User Dashboard CSS
import './pages/admin/AdminComponents.css';

const ScrollProgress = lazy(() => import('./components/ScrollProgress'));
const ImpersonationBanner = lazy(() => import('./components/ImpersonationBanner'));

const Landing = lazy(() => import('./pages/Landing'));
const PublicPortfolio = lazy(() => import('./pages/PublicPortfolio'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

const UserLayout = lazy(() => import('./pages/admin/AdminLayout'));
const UserDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPublish = lazy(() => import('./pages/admin/AdminPublish'));
const UserProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const UserSkills = lazy(() => import('./pages/admin/AdminSkills'));
const UserExperience = lazy(() => import('./pages/admin/AdminExperience'));
const AdminMilestones = lazy(() => import('./pages/admin/AdminMilestones'));
const UserMessages = lazy(() => import('./pages/admin/AdminMessages'));
const UserProfile = lazy(() => import('./pages/admin/AdminProfile'));
const AdminPanel = lazy(() => import('./pages/admin/SuperAdminPanel'));
const ProtectedRoute = lazy(() => import('./pages/admin/ProtectedRoute'));

function RouteFallback() {
  return (
    <div
      aria-live="polite"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <LoadingSkeleton variant="title" />
    </div>
  );
}

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
            <Suspense fallback={null}>
              <ImpersonationBanner />
            </Suspense>
            <ScrollToTop />
            <Suspense fallback={null}>
              <ScrollProgress />
            </Suspense>

            <Suspense fallback={<RouteFallback />}>
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
                  <Route path="publish" element={<AdminPublish />} />
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
            </Suspense>

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
