import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FaRocket, FaPaintBrush, FaShieldAlt,
  FaLink, FaChartLine, FaMobileAlt,
} from 'react-icons/fa';
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
    desc: 'Get your own public portfolio at icompaas.com/yourname — share it anywhere.',
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>iCompaas — Build Your Developer Portfolio in Minutes</title>
        <meta
          name="description"
          content="Create a stunning developer portfolio with a custom URL. Showcase your projects, skills, and experience — all for free."
        />
      </Helmet>

      <div className="landing">
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
              Build Your <span>Developer Portfolio</span> in Minutes
            </h1>
            <p className="landing-hero__subtitle">
              Create a stunning portfolio with projects, skills, and experience.
              Get your own unique URL and start impressing recruiters today.
            </p>
            <div className="landing-hero__actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ─── Features ─────────────────────────────────── */}
        <section className="landing-features">
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
        <section className="landing-steps">
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
              Join developers who've already built their portfolio on iCompaas.
              It's free, fast, and looks incredible.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Your Portfolio →
            </Link>
          </motion.div>
        </section>

        {/* ─── Footer ─────────────────────────────────────── */}
        <footer className="landing-footer">
          © {new Date().getFullYear()} iCompaas. All rights reserved.
        </footer>
      </div>
    </>
  );
}
