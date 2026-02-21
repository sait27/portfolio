import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FaRocket, FaPaintBrush, FaShieldAlt,
  FaLink, FaChartLine, FaMobileAlt,
  FaCheckCircle, FaLaptopCode, FaUserTie, FaUsers, FaClock, FaGlobe,
} from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import './Landing.css';

const features = [
  {
    icon: <FaPaintBrush />,
    color: 'purple',
    title: 'Beautiful Themes',
    desc: 'Professionally designed dark-mode portfolio that looks stunning on any device.',
  },
  {
    icon: <FaRocket />,
    color: 'cyan',
    title: 'Live in Seconds',
    desc: 'Sign up, fill in your details, and your portfolio is instantly live with a unique URL.',
  },
  {
    icon: <FaLink />,
    color: 'pink',
    title: 'Custom URL',
    desc: 'Get your own public portfolio at portfoliohub.com/yourname — share it anywhere.',
  },
  {
    icon: <FaShieldAlt />,
    color: 'green',
    title: 'Secure Dashboard',
    desc: 'Manage projects, skills, experience, and messages from your private dashboard.',
  },
  {
    icon: <FaChartLine />,
    color: 'amber',
    title: 'Project Showcase',
    desc: 'Highlight your best work with categories, tech stacks, and featured badges.',
  },
  {
    icon: <FaMobileAlt />,
    color: 'blue',
    title: 'Fully Responsive',
    desc: 'Looks perfect on desktop, tablet, and mobile — optimized for every screen.',
  },
];

const proofStats = [
  { value: '5 min', label: 'Average setup time' },
  { value: '100%', label: 'Mobile responsive pages' },
  { value: '10+', label: 'Content sections available' },
  { value: '24/7', label: 'Live public portfolio URL' },
];

const audienceCards = [
  {
    icon: <FaLaptopCode />,
    title: 'Students & Freshers',
    points: [
      'Show projects, internships, and certifications in one place.',
      'Share a clean profile link directly in applications.',
      'Stand out from generic resume-only submissions.',
    ],
  },
  {
    icon: <FaUserTie />,
    title: 'Working Professionals',
    points: [
      'Highlight impact with experience, achievements, and proof links.',
      'Maintain a polished public profile outside social platforms.',
      'Update sections from dashboard without touching code.',
    ],
  },
  {
    icon: <FaUsers />,
    title: 'Freelancers & Consultants',
    points: [
      'Showcase testimonials and featured work for instant credibility.',
      'Use one branded URL in proposals and client outreach.',
      'Turn profile views into inbound project conversations.',
    ],
  },
];

const faqs = [
  {
    q: 'Do I need coding knowledge to use PortfolioHub?',
    a: 'No. You can create and manage your entire portfolio from the dashboard using simple forms.',
  },
  {
    q: 'Can I choose which sections appear publicly?',
    a: 'Yes. You can toggle section visibility and navbar links from profile controls at any time.',
  },
  {
    q: 'Can I edit content later?',
    a: 'Yes. Projects, skills, blog posts, testimonials, milestones, and profile data are fully editable.',
  },
  {
    q: 'Will my portfolio work on mobile devices?',
    a: 'Yes. Every page is optimized for desktop, tablet, and mobile by default.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>PortfolioHub — Build Your Developer Brand in Minutes</title>
        <meta
          name="description"
          content="Create a stunning developer portfolio with a custom URL. Showcase your projects, skills, and experience — all for free."
        />
      </Helmet>

      <div className="landing">
        {/* ─── Navbar ──────────────────────────────────────── */}
        <motion.nav
          className={`landing-nav ${isScrolled ? 'landing-nav--scrolled' : ''}`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="landing-nav__container">
            <Link to="/" className="landing-nav__logo">
              <span className="gradient-text">PortfolioHub</span>
            </Link>
            <div className="landing-nav__links">
              <a href="#features">Features</a>
              <a href="#benefits">Benefits</a>
              <a href="#audience">Who It&apos;s For</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#faq">FAQ</a>
              <Link to="/user/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
            <button
              className="landing-nav__toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="landing-nav__mobile"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#benefits" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
                <a href="#audience" onClick={() => setMobileMenuOpen(false)}>Who It&apos;s For</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <Link to="/user/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
        {/* ─── Hero ──────────────────────────────────────── */}
        <section className="landing-hero">
          <motion.div
            className="landing-hero__content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="landing-hero__badge">
              <FaRocket /> Now in Beta — Free for Everyone
            </div>
            <h1 className="landing-hero__title">
              Build Your <span>Developer Brand</span> in Minutes
            </h1>
            <p className="landing-hero__subtitle">
              Create a stunning portfolio with projects, skills, and experience.
              Get your own unique URL and start impressing recruiters today.
            </p>
            <div className="landing-hero__actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link to="/user/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ─── Features ─────────────────────────────────── */}
        <section id="benefits" className="landing-proof">
          <div className="landing-section-header">
            <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
              Built for Fast Career Momentum
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" variants={fadeUp} custom={1} viewport={{ once: true }}>
              PortfolioHub combines portfolio publishing, credibility, and content control in one workflow.
            </motion.p>
          </div>

          <div className="landing-proof__grid">
            {proofStats.map((item, i) => (
              <motion.article
                key={item.label}
                className="proof-card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={i}
                viewport={{ once: true }}
              >
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </motion.article>
            ))}
          </div>

          <div className="landing-benefits">
            <motion.article
              className="benefit-card glass"
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              viewport={{ once: true }}
            >
              <h3><FaClock /> Faster than building from scratch</h3>
              <p>
                No template hunting, no deployment setup, no repeated redesign work.
                Focus on your content, not tooling.
              </p>
              <ul>
                <li><FaCheckCircle /> Ready-to-use structure for projects, skills, and achievements</li>
                <li><FaCheckCircle /> Dedicated admin dashboard for updates</li>
                <li><FaCheckCircle /> Professional public profile URL instantly available</li>
              </ul>
            </motion.article>
            <motion.article
              className="benefit-card glass"
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              custom={1}
              viewport={{ once: true }}
            >
              <h3><FaGlobe /> Portfolio that sells your profile</h3>
              <p>
                Present your work with context and proof so recruiters and clients
                understand your value in seconds.
              </p>
              <ul>
                <li><FaCheckCircle /> Rich sections for experience, education, certificates, and social proof</li>
                <li><FaCheckCircle /> Selective visibility controls for public and navigation sections</li>
                <li><FaCheckCircle /> Built-in contact flow to capture inbound opportunities</li>
              </ul>
            </motion.article>
          </div>
        </section>

        <section id="features" className="landing-features">
          <div className="landing-section-header">
            <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
              Everything You Need
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" variants={fadeUp} custom={1} viewport={{ once: true }}>
              All the tools to build, manage, and share your portfolio
            </motion.p>
          </div>

          <div className="landing-features__grid">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="feature-card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={i}
                viewport={{ once: true }}
              >
                <div className={`feature-card__icon feature-card__icon--${f.color}`}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─────────────────────────────── */}
        <section id="audience" className="landing-audience">
          <div className="landing-section-header">
            <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
              Who PortfolioHub Helps Most
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" variants={fadeUp} custom={1} viewport={{ once: true }}>
              Tailored for developers at different stages of growth.
            </motion.p>
          </div>
          <div className="landing-audience__grid">
            {audienceCards.map((item, i) => (
              <motion.article
                key={item.title}
                className="audience-card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={i}
                viewport={{ once: true }}
              >
                <div className="audience-card__icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>
                      <FaCheckCircle />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="landing-steps">
          <div className="landing-section-header">
            <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
              Three Simple Steps
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" variants={fadeUp} custom={1} viewport={{ once: true }}>
              From signup to live portfolio in under 5 minutes
            </motion.p>
          </div>

          <div className="landing-steps__grid">
            {[
              { num: '1', title: 'Create Your Account', desc: 'Pick a username — it becomes your portfolio URL.' },
              { num: '2', title: 'Add Your Content', desc: 'Fill in projects, skills, experience, and profile details.' },
              { num: '3', title: 'Share Everywhere', desc: 'Your portfolio is live! Share the link with recruiters and clients.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                className="step-card"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={i}
                viewport={{ once: true }}
              >
                <div className="step-card__number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── CTA ──────────────────────────────────────── */}
        <section id="faq" className="landing-faq">
          <div className="landing-section-header">
            <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
              Frequently Asked Questions
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" variants={fadeUp} custom={1} viewport={{ once: true }}>
              Quick answers before you start building.
            </motion.p>
          </div>
          <div className="landing-faq__grid">
            {faqs.map((item, i) => (
              <motion.article
                key={item.q}
                className="faq-card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={i}
                viewport={{ once: true }}
              >
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <motion.div
            className="landing-cta__content"
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            viewport={{ once: true }}
          >
            <h2>Ready to Stand Out?</h2>
            <p>
              Join developers who've already built their portfolio on PortfolioHub.
              It's free, fast, and looks incredible.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Your Portfolio →
            </Link>
          </motion.div>
        </section>

        {/* ─── Footer ─────────────────────────────────────── */}
        <footer className="landing-footer">
          © {new Date().getFullYear()} PortfolioHub. All rights reserved.
        </footer>
      </div>
    </>
  );
}
