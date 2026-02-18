import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaGithub, FaLinkedin, FaArrowRight } from 'react-icons/fa';
import { HiDownload } from 'react-icons/hi';
import SectionWrapper from '../components/SectionWrapper';
import { CardSkeleton } from '../components/LoadingSkeleton';
import PageTransition from '../components/PageTransition';
import { publicApi } from '../api/client';
import './Home.css';

// ─── Hero Section ──────────────────────────────────────────────────────────

function HeroSection() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    publicApi.getProfile()
      .then(res => setProfile(res.data))
      .catch(() => {});
  }, []);

  return (
    <section className="hero">
      {/* Animated background orbs */}
      <div className="hero__orbs">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
      </div>

      <div className="container hero__content">
        <motion.div
          className="hero__text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.p
            className="hero__greeting"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Hello, I'm
          </motion.p>

          <h1 className="hero__name">
            <span className="gradient-text">
              {profile?.full_name || 'Creative Developer'}
            </span>
          </h1>

          <motion.p
            className="hero__tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {profile?.tagline || 'Building digital experiences with code & creativity'}
          </motion.p>

          <motion.p
            className="hero__bio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {profile?.bio?.substring(0, 150) || 'Full-stack developer passionate about crafting beautiful, performant web applications.'}
            {profile?.bio?.length > 150 ? '...' : ''}
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/projects" className="btn btn-primary btn-lg">
              View My Work <FaArrowRight />
            </Link>
            {profile?.resume && (
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
              >
                <HiDownload /> Resume
              </a>
            )}
          </motion.div>

          <motion.div
            className="hero__socials"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub size={22} />
              </a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin size={22} />
              </a>
            )}
          </motion.div>
        </motion.div>

        {/* Hero visual — animated code card */}
        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="hero__card glass">
            <div className="hero__card-dots">
              <span /><span /><span />
            </div>
            <pre className="hero__code">
{`const developer = {
  name: "${profile?.full_name || 'Sai'}",
  skills: ["Python", "Django",
           "React", "AI/ML"],
  passion: "Building things
           that matter",
  coffee: Infinity ☕
};`}
            </pre>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="hero__scroll-line" />
      </motion.div>
    </section>
  );
}

// ─── Featured Projects ─────────────────────────────────────────────────────

function FeaturedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getProjects({ featured: true })
      .then(res => {
        const data = res.data.results || res.data;
        setProjects(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SectionWrapper id="featured">
      <div className="featured__header">
        <h2 className="section-title">
          Featured <span className="gradient-text">Projects</span>
        </h2>
        <p className="section-subtitle">
          A selection of my recent work that I'm most proud of.
        </p>
      </div>

      {loading ? (
        <div className="featured__grid">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length > 0 ? (
        <div className="featured__grid">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              className="featured__card glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8 }}
            >
              <div className="featured__card-img">
                <img
                  src={project.thumbnail || 'https://via.placeholder.com/600x400/16161f/7c3aed?text=Project'}
                  alt={project.title}
                />
                <div className="featured__card-overlay">
                  <Link to={`/projects`} className="btn btn-primary btn-sm">
                    View Details <FaArrowRight />
                  </Link>
                </div>
              </div>
              <div className="featured__card-body">
                <span className="chip">{project.category}</span>
                <h3 className="featured__card-title">{project.title}</h3>
                <p className="featured__card-desc">{project.short_description}</p>
                <div className="featured__card-tech">
                  {project.tech_stack?.slice(0, 4).map(skill => (
                    <span key={skill.id} className="chip">{skill.name}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="featured__empty">
          <p className="section-subtitle">No featured projects yet. Check back soon!</p>
        </div>
      )}

      <div className="featured__cta">
        <Link to="/projects" className="btn btn-outline">
          View All Projects <FaArrowRight />
        </Link>
      </div>
    </SectionWrapper>
  );
}

// ─── CTA Section ───────────────────────────────────────────────────────────

function CTASection() {
  return (
    <SectionWrapper className="cta-section">
      <div className="cta__card glass">
        <h2 className="section-title">
          Let's Build Something <span className="gradient-text">Amazing</span>
        </h2>
        <p className="cta__text">
          Have a project in mind? I'd love to hear about it. Let's discuss how we can work together.
        </p>
        <Link to="/contact" className="btn btn-primary btn-lg">
          Get In Touch <FaArrowRight />
        </Link>
      </div>
    </SectionWrapper>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <PageTransition>
      <Helmet>
        <title>Portfolio | Creative Developer</title>
        <meta name="description" content="Full-stack developer portfolio showcasing projects, skills, and experience." />
      </Helmet>
      <HeroSection />
      <FeaturedProjects />
      <CTASection />
    </PageTransition>
  );
}
