import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaGithub, FaLinkedin, FaArrowRight, FaArrowDown, FaBriefcase, FaCalendarAlt } from 'react-icons/fa';
import { HiDownload } from 'react-icons/hi';
import SectionWrapper from '../components/SectionWrapper';
import { CardSkeleton } from '../components/LoadingSkeleton';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PageTransition from '../components/PageTransition';
import { publicApi } from '../api/client';
import './Home.css';

/* ═══════════════════════════════════════════════════════════════════════════
   1. HERO SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function HeroSection() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    publicApi.getProfile().then(res => setProfile(res.data)).catch(() => {});
  }, []);

  return (
    <section className="hero" id="hero">
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
            👋 Hello, I'm
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
            {profile?.bio?.substring(0, 180) || 'Full-stack developer passionate about crafting beautiful, performant web applications and solving real-world problems with technology.'}
            {profile?.bio?.length > 180 ? '...' : ''}
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
              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
                <HiDownload /> Resume
              </a>
            )}
            <Link to="/contact" className="btn btn-outline btn-lg">
              Contact Me
            </Link>
          </motion.div>

          <motion.div
            className="hero__socials"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub size={22} /></a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin size={22} /></a>
            )}
          </motion.div>
        </motion.div>

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

      <motion.a
        href="#about-preview"
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        aria-label="Scroll down"
      >
        <FaArrowDown className="hero__scroll-arrow" />
      </motion.a>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. ABOUT PREVIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function AboutPreview() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    publicApi.getProfile().then(res => setProfile(res.data)).catch(() => {});
  }, []);

  return (
    <SectionWrapper id="about-preview" className="about-preview">
      <div className="about-preview__grid">
        <motion.div
          className="about-preview__image"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="about-preview__img-wrapper glass">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile?.full_name} />
            ) : (
              <div className="about-preview__placeholder">
                <span className="gradient-text" style={{ fontSize: '4rem', fontWeight: 900 }}>
                  {profile?.full_name?.charAt(0) || 'S'}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="about-preview__content"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="about-preview__text">
            {profile?.bio || 'I am a passionate developer who loves building innovative solutions. My journey in tech started with curiosity and evolved into a career dedicated to creating impactful digital products.'}
          </p>
          <div className="about-preview__highlights">
            <div className="about-preview__stat glass">
              <span className="about-preview__stat-value gradient-text">3+</span>
              <span className="about-preview__stat-label">Years Experience</span>
            </div>
            <div className="about-preview__stat glass">
              <span className="about-preview__stat-value gradient-text">10+</span>
              <span className="about-preview__stat-label">Projects Built</span>
            </div>
            <div className="about-preview__stat glass">
              <span className="about-preview__stat-value gradient-text">15+</span>
              <span className="about-preview__stat-label">Technologies</span>
            </div>
          </div>
          <Link to="/about" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>
            Read More <FaArrowRight />
          </Link>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. SKILLS SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function SkillsShowcase() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getSkills()
      .then(res => {
        const data = res.data.results || res.data;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SectionWrapper id="skills" className="skills-home">
      <div className="skills-home__header">
        <h2 className="section-title">
          Skills & <span className="gradient-text">Technologies</span>
        </h2>
        <p className="section-subtitle">
          Technologies I work with to bring ideas to life.
        </p>
      </div>

      {loading ? (
        <div className="skills-home__grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skills-home__category glass">
              <LoadingSkeleton variant="title" />
              <LoadingSkeleton variant="text" count={2} />
            </div>
          ))}
        </div>
      ) : (
        <div className="skills-home__grid">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="skills-home__category glass"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: '0 0 40px rgba(124,58,237,0.15)' }}
            >
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
      )}
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. FEATURED PROJECTS
   ═══════════════════════════════════════════════════════════════════════════ */

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
    <SectionWrapper id="projects">
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
                  <Link to="/projects" className="btn btn-primary btn-sm">
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
        <div className="featured__empty glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="section-subtitle" style={{ maxWidth: '100%' }}>
            No featured projects yet — add some from the admin panel!
          </p>
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

/* ═══════════════════════════════════════════════════════════════════════════
   5. EXPERIENCE PREVIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function ExperiencePreview() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getExperience()
      .then(res => {
        const data = res.data.results || res.data;
        setExperiences(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && experiences.length === 0) return null;

  return (
    <SectionWrapper id="experience" className="exp-home">
      <div className="exp-home__header">
        <h2 className="section-title">
          Work <span className="gradient-text">Experience</span>
        </h2>
        <p className="section-subtitle">My professional journey so far.</p>
      </div>

      {loading ? (
        <LoadingSkeleton variant="text" count={4} />
      ) : (
        <div className="exp-home__list">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              className="exp-home__item glass"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
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
                    {exp.highlights.slice(0, 2).map((h, j) => <li key={j}>{h}</li>)}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/about" className="btn btn-outline">
          View Full Timeline <FaArrowRight />
        </Link>
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. FEATURED BLOGS
   ═══════════════════════════════════════════════════════════════════════════ */

function FeaturedBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getBlogs({ is_published: true, is_featured: true })
      .then(res => {
        const data = res.data.results || res.data;
        setBlogs(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && blogs.length === 0) return null;

  return (
    <SectionWrapper id="blogs">
      <div className="blogs__header">
        <h2 className="section-title">
          Latest <span className="gradient-text">Articles</span>
        </h2>
        <p className="section-subtitle">
          Insights and tutorials from my development journey.
        </p>
      </div>

      {loading ? (
        <div className="blogs__grid">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="blogs__grid">
          {blogs.map((blog, i) => (
            <motion.article
              key={blog.id}
              className="blogs__card glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8 }}
            >
              <div className="blogs__card-img">
                <img
                  src={blog.thumbnail || 'https://via.placeholder.com/600x300/16161f/7c3aed?text=Blog'}
                  alt={blog.title}
                />
              </div>
              <div className="blogs__card-body">
                <div className="blogs__card-meta">
                  <span className="chip">
                    <FaCalendarAlt style={{ fontSize: '0.6rem' }} />
                    {new Date(blog.published_at).toLocaleDateString()}
                  </span>
                  <span className="chip">{blog.read_time}</span>
                </div>
                <h3 className="blogs__card-title">{blog.title}</h3>
                <p className="blogs__card-excerpt">{blog.excerpt}</p>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="blogs__card-tags">
                    {blog.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="chip">{tag}</span>
                    ))}
                  </div>
                )}
                <Link to="/blog" className="btn btn-outline btn-sm">
                  Read More <FaArrowRight />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <div className="blogs__cta">
        <Link to="/blog" className="btn btn-outline">
          View All Articles <FaArrowRight />
        </Link>
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. TESTIMONIALS SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getTestimonials({ is_featured: true })
      .then(res => {
        const data = res.data.results || res.data;
        setTestimonials(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && testimonials.length === 0) return null;

  return (
    <SectionWrapper id="testimonials">
      <div className="testimonials-home__header">
        <h2 className="section-title">
          What People <span className="gradient-text">Say</span>
        </h2>
        <p className="section-subtitle">
          Feedback from clients and colleagues I've worked with.
        </p>
      </div>

      {loading ? (
        <div className="testimonials-home__grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="testimonials-home__card glass">
              <LoadingSkeleton variant="text" count={3} />
            </div>
          ))}
        </div>
      ) : (
        <div className="testimonials-home__grid">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              className="testimonials-home__card glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -4 }}
            >
              <div className="testimonials-home__rating">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className={`star ${j < testimonial.rating ? 'active' : ''}`}>★</span>
                ))}
              </div>
              <p className="testimonials-home__text">
                "{testimonial.content}"
              </p>
              <div className="testimonials-home__author">
                {testimonial.client_avatar && (
                  <img
                    src={testimonial.client_avatar}
                    alt={testimonial.client_name}
                    className="testimonials-home__avatar"
                  />
                )}
                <div className="testimonials-home__author-info">
                  <h4 className="testimonials-home__name">{testimonial.client_name}</h4>
                  <p className="testimonials-home__role">
                    {testimonial.client_role} at {testimonial.client_company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="testimonials-home__cta">
        <Link to="/testimonials" className="btn btn-outline">
          View All Testimonials <FaArrowRight />
        </Link>
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   8. RESUME SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function ResumeSection() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    publicApi.getProfile().then(res => setProfile(res.data)).catch(() => {});
  }, []);

  // Only show if resume URL exists
  if (!profile?.resume) return null;

  return (
    <SectionWrapper className="resume-section">
      <motion.div
        className="resume__card glass"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="resume__content">
          <h2 className="section-title">
            Download My <span className="gradient-text">Resume</span>
          </h2>
          <p className="resume__text">
            Want a detailed look at my experience, skills, and education? 
            Download my resume for the full picture.
          </p>
        </div>
        <a
          href={profile.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg"
        >
          <HiDownload /> Download Resume
        </a>
      </motion.div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   9. CTA SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

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
        <div className="cta__actions">
          <Link to="/contact" className="btn btn-primary btn-lg">
            Get In Touch <FaArrowRight />
          </Link>
          <Link to="/projects" className="btn btn-outline btn-lg">
            See My Work
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME PAGE — ALL SECTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <PageTransition>
      <Helmet>
        <title>Portfolio | Creative Developer</title>
        <meta name="description" content="Full-stack developer portfolio showcasing projects, skills, and experience in Python, Django, React, and AI/ML." />
      </Helmet>
      <HeroSection />
      <AboutPreview />
      <SkillsShowcase />
      <FeaturedProjects />
      <ExperiencePreview />
      <FeaturedBlogs />
      <TestimonialsSection />
      <ResumeSection />
      <CTASection />
    </PageTransition>
  );
}
