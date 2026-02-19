import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaArrowDown,
  FaBriefcase, FaCalendarAlt, FaExternalLinkAlt, FaPaperPlane,
} from 'react-icons/fa';
import { HiDownload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import SectionWrapper from '../components/SectionWrapper';
import LoadingSkeleton, { CardSkeleton } from '../components/LoadingSkeleton';
import { publicApi } from '../api/client';
import './PublicPortfolio.css';
import '../pages/Home.css';

// ─── Animations ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

// ═══════════════════════════════════════════════════════════════
// PUBLIC PORTFOLIO PAGE
// ═══════════════════════════════════════════════════════════════

export default function PublicPortfolio() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    Promise.all([
      publicApi.getProfile(username).catch(() => null),
      publicApi.getSkills(username).catch(() => ({ data: [] })),
      publicApi.getProjects(username).catch(() => ({ data: [] })),
      publicApi.getExperience(username).catch(() => ({ data: [] })),
    ]).then(([profileRes, skillsRes, projectsRes, expRes]) => {
      if (!profileRes) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileRes.data);

      const skillData = skillsRes.data?.results || skillsRes.data;
      setSkills(Array.isArray(skillData) ? skillData : []);

      const projData = projectsRes.data?.results || projectsRes.data;
      setProjects(Array.isArray(projData) ? projData : []);

      const expData = expRes.data?.results || expRes.data;
      setExperience(Array.isArray(expData) ? expData : []);

      setLoading(false);
    });
  }, [username]);

  // ─── Not Found ─────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="portfolio-not-found">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Portfolio Not Found</h1>
          <p>No portfolio exists for <strong>@{username}</strong></p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </motion.div>
      </div>
    );
  }

  // ─── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSkeleton variant="title" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile?.full_name || username} | Portfolio</title>
        <meta
          name="description"
          content={profile?.tagline || `${profile?.full_name}'s developer portfolio`}
        />
      </Helmet>

      {/* ─── Navbar ──────────────────────────────────── */}
      <nav className="portfolio-nav">
        <span className="portfolio-nav__name gradient-text">
          {profile?.full_name || username}
        </span>
        <div className="portfolio-nav__links">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="hero" id="hero" style={{ paddingTop: '5rem' }}>
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
            transition={{ duration: 0.7 }}
          >
            <motion.p className="hero__greeting" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              👋 Hello, I'm
            </motion.p>
            <h1 className="hero__name">
              <span className="gradient-text">{profile?.full_name}</span>
            </h1>
            <motion.p className="hero__tagline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {profile?.tagline || 'Developer & Creator'}
            </motion.p>
            <motion.p className="hero__bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {profile?.bio?.substring(0, 200)}{profile?.bio?.length > 200 ? '...' : ''}
            </motion.p>
            <motion.div className="hero__actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <a href="#projects" className="btn btn-primary btn-lg">View My Work</a>
              {profile?.resume && (
                <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
                  <HiDownload /> Resume
                </a>
              )}
              <a href="#contact" className="btn btn-outline btn-lg">Contact Me</a>
            </motion.div>
            <motion.div className="hero__socials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              {profile?.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub size={22} /></a>}
              {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin size={22} /></a>}
              {profile?.twitter_url && <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter size={22} /></a>}
            </motion.div>
          </motion.div>

          <motion.div className="hero__visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <div className="hero__card glass">
              <div className="hero__card-dots"><span /><span /><span /></div>
              <pre className="hero__code">
{`const developer = {
  name: "${profile?.full_name || username}",
  skills: [${skills.flatMap(c => c.skills?.slice(0, 2).map(s => `"${s.name}"`)).slice(0, 4).join(', ')}],
  passion: "Building things
           that matter",
  coffee: Infinity ☕
};`}
              </pre>
            </div>
          </motion.div>
        </div>

        <motion.a href="#about" className="hero__scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <FaArrowDown className="hero__scroll-arrow" />
        </motion.a>
      </section>

      {/* ─── About ─────────────────────────────────────── */}
      <SectionWrapper id="about" className="about-preview">
        <div className="about-preview__grid">
          <motion.div className="about-preview__image" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="about-preview__img-wrapper glass">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile?.full_name} />
              ) : (
                <div className="about-preview__placeholder">
                  <span className="gradient-text" style={{ fontSize: '4rem', fontWeight: 900 }}>
                    {profile?.full_name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
          <motion.div className="about-preview__content" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="section-title">About <span className="gradient-text">Me</span></h2>
            <p className="about-preview__text">{profile?.bio || 'No bio yet.'}</p>
            <div className="about-preview__highlights">
              <div className="about-preview__stat glass">
                <span className="about-preview__stat-value gradient-text">{projects.length}</span>
                <span className="about-preview__stat-label">Projects</span>
              </div>
              <div className="about-preview__stat glass">
                <span className="about-preview__stat-value gradient-text">{skills.reduce((a, c) => a + (c.skills?.length || 0), 0)}</span>
                <span className="about-preview__stat-label">Skills</span>
              </div>
              <div className="about-preview__stat glass">
                <span className="about-preview__stat-value gradient-text">{experience.length}</span>
                <span className="about-preview__stat-label">Experience</span>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ─── Skills ─────────────────────────────────────── */}
      {skills.length > 0 && (
        <SectionWrapper id="skills" className="skills-home">
          <div className="skills-home__header">
            <h2 className="section-title">Skills & <span className="gradient-text">Technologies</span></h2>
          </div>
          <div className="skills-home__grid">
            {skills.map((cat, i) => (
              <motion.div key={cat.id} className="skills-home__category glass" initial="hidden" whileInView="visible" variants={fadeUp} custom={i} viewport={{ once: true }}>
                <h3 className="skills-home__cat-name">{cat.name}</h3>
                <div className="skills-home__list">
                  {cat.skills?.map(skill => (
                    <span key={skill.id} className="chip">
                      {skill.icon && <img src={skill.icon} alt="" className="skills-home__icon" />}
                      {skill.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* ─── Projects ─────────────────────────────────── */}
      <SectionWrapper id="projects">
        <div className="featured__header">
          <h2 className="section-title">My <span className="gradient-text">Projects</span></h2>
        </div>
        {projects.length > 0 ? (
          <div className="featured__grid">
            {projects.map((project, i) => (
              <motion.div key={project.id} className="featured__card glass" initial="hidden" whileInView="visible" variants={fadeUp} custom={i} viewport={{ once: true }} whileHover={{ y: -8 }}>
                <div className="featured__card-img">
                  <img src={project.thumbnail || `https://via.placeholder.com/600x400/16161f/7c3aed?text=${encodeURIComponent(project.title)}`} alt={project.title} />
                  <div className="featured__card-overlay">
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                        Live Demo <FaExternalLinkAlt />
                      </a>
                    )}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                        <FaGithub /> Code
                      </a>
                    )}
                  </div>
                </div>
                <div className="featured__card-body">
                  {project.category && <span className="chip">{project.category}</span>}
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
          <div className="featured__empty glass" style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="section-subtitle" style={{ maxWidth: '100%' }}>No projects to show yet.</p>
          </div>
        )}
      </SectionWrapper>

      {/* ─── Experience ─────────────────────────────────── */}
      {experience.length > 0 && (
        <SectionWrapper id="experience" className="exp-home">
          <div className="exp-home__header">
            <h2 className="section-title">Work <span className="gradient-text">Experience</span></h2>
          </div>
          <div className="exp-home__list">
            {experience.map((exp, i) => (
              <motion.div key={exp.id} className="exp-home__item glass" initial="hidden" whileInView="visible" variants={fadeUp} custom={i} viewport={{ once: true }}>
                <div className="exp-home__dot" />
                <div className="exp-home__content">
                  <div className="exp-home__top">
                    <div>
                      <h3 className="exp-home__role">{exp.role}</h3>
                      <span className="exp-home__company">
                        <FaBriefcase className="exp-home__icon" /> {exp.company}
                      </span>
                    </div>
                    <div className="exp-home__meta">
                      <span className="chip">
                        <FaCalendarAlt style={{ fontSize: '0.6rem' }} />
                        {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                      </span>
                      {exp.duration && <span className="chip chip-active">{exp.duration}</span>}
                    </div>
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="exp-home__highlights">
                      {exp.highlights.map((h, j) => <li key={j}>{h}</li>)}
                    </ul>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* ─── Contact ────────────────────────────────────── */}
      <ContactSection username={username} profileName={profile?.full_name} />

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border-primary)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
        Built with <span className="gradient-text">iCompaas</span> · © {new Date().getFullYear()} {profile?.full_name}
      </footer>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTACT SECTION
// ═══════════════════════════════════════════════════════════════

function ContactSection({ username, profileName }) {
  const [form, setForm] = useState({ sender_name: '', sender_email: '', subject: '', content: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sender_name || !form.sender_email || !form.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    try {
      await publicApi.sendMessage(username, form);
      setSent(true);
      toast.success('Message sent!');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SectionWrapper id="contact">
      <h2 className="section-title" style={{ textAlign: 'center' }}>
        Get In <span className="gradient-text">Touch</span>
      </h2>
      <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Have a question or want to work together? Drop me a message!
      </p>

      <div className="portfolio-contact">
        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3>Message Sent!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Thanks for reaching out to {profileName}. They'll get back to you soon!
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="portfolio-contact__form">
            <div className="portfolio-contact__row">
              <div className="form-group">
                <label className="form-label" htmlFor="c-name">Name *</label>
                <input id="c-name" type="text" className="form-input" placeholder="Your name" value={form.sender_name} onChange={handleChange('sender_name')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="c-email">Email *</label>
                <input id="c-email" type="email" className="form-input" placeholder="you@example.com" value={form.sender_email} onChange={handleChange('sender_email')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="c-subject">Subject</label>
              <input id="c-subject" type="text" className="form-input" placeholder="What's this about?" value={form.subject} onChange={handleChange('subject')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="c-message">Message *</label>
              <textarea id="c-message" className="form-input" placeholder="Your message..." value={form.content} onChange={handleChange('content')} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={sending} style={{ width: '100%' }}>
              {sending ? 'Sending...' : <><FaPaperPlane /> Send Message</>}
            </button>
          </form>
        )}
      </div>
    </SectionWrapper>
  );
}
