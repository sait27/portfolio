import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <AnimatedRoutes />
          </main>
          <Footer />
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
    </HelmetProvider>
  );
}
