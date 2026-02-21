import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ScrollProgress from './components/ScrollProgress';
import ImpersonationBanner from './components/ImpersonationBanner';

// Public / Marketing
import Landing from './pages/Landing';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Testimonials from './pages/Testimonials';
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

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <ImpersonationBanner />
            <ScrollToTop />
            <ScrollProgress />

            <Routes>
              {/* Marketing */}
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/testimonials" element={<Testimonials />} />

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
