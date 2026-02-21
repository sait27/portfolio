import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';
import SectionWrapper from '../components/SectionWrapper';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { publicApi } from '../api/client';
import './About.css';

// ─── Profile Section ───────────────────────────────────────────────────────

function ProfileSection() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getProfile()
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SectionWrapper className="about-profile">
        <div className="about-profile__grid">
          <LoadingSkeleton variant="avatar" />
          <div>
            <LoadingSkeleton variant="title" />
            <LoadingSkeleton variant="text" count={4} />
          </div>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper className="about-profile">
      <div className="about-profile__grid">
        <motion.div
          className="about-profile__avatar"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="about-profile__img-wrapper">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile?.full_name} />
            ) : (
              <div className="about-profile__placeholder">
                <span className="gradient-text">
                  {profile?.full_name?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>

          {/* Social links */}
          <div className="about-profile__socials">
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            )}
            {profile?.twitter_url && (
              <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            )}
            {profile?.email && (
              <a href={`mailto:${profile.email}`}><FaEnvelope /></a>
            )}
          </div>
        </motion.div>

        <motion.div
          className="about-profile__info"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="about-profile__tagline">{profile?.tagline}</p>
          <div className="about-profile__bio">
            {profile?.bio?.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            )) || <p>Bio not configured yet.</p>}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

// ─── Skills Section ────────────────────────────────────────────────────────

function SkillsSection() {
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
    <SectionWrapper className="about-skills">
      <div className="about-skills__header">
        <h2 className="section-title">
          Skills & <span className="gradient-text">Technologies</span>
        </h2>
        <p className="section-subtitle">
          Tools and technologies I work with regularly.
        </p>
      </div>

      {loading ? (
        <div className="about-skills__grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="about-skills__category glass">
              <LoadingSkeleton variant="title" />
              <LoadingSkeleton variant="text" count={3} />
            </div>
          ))}
        </div>
      ) : (
        <div className="about-skills__grid">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="about-skills__category glass"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 0 40px rgba(124,58,237,0.15)' }}
            >
              <h3 className="about-skills__category-name">{cat.name}</h3>
              <div className="about-skills__list">
                {cat.skills?.map(skill => (
                  <span key={skill.id} className="about-skills__skill chip">
                    {skill.icon && <img src={skill.icon} alt="" className="about-skills__icon" />}
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

// ─── Experience Timeline ───────────────────────────────────────────────────

function ExperienceTimeline() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getExperience()
      .then(res => {
        const data = res.data.results || res.data;
        setExperiences(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || experiences.length === 0) {
    return null; // Don't show section if no experience data
  }

  return (
    <SectionWrapper className="about-timeline">
      <div className="about-timeline__header">
        <h2 className="section-title">
          Work <span className="gradient-text">Experience</span>
        </h2>
      </div>

      <div className="timeline">
        {experiences.map((exp, i) => (
          <motion.div
            key={exp.id}
            className={`timeline__item ${i % 2 === 0 ? 'timeline__item--left' : 'timeline__item--right'}`}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="timeline__card glass">
              <div className="timeline__header">
                <h3 className="timeline__role">{exp.role}</h3>
                <span className="timeline__company">{exp.company}</span>
              </div>
              <div className="timeline__meta">
                <span className="timeline__date">
                  {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                </span>
                {exp.duration && <span className="chip chip-active">{exp.duration}</span>}
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="timeline__highlights">
                  {exp.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ─── About Page ────────────────────────────────────────────────────────────

export default function About() {
  return (
    <PageTransition>
      <Helmet>
        <title>About | Portfolio</title>
        <meta name="description" content="Learn about my skills, experience, and what drives me as a developer." />
      </Helmet>
      <Navbar />
      <div style={{ paddingTop: '5rem' }}>
        <ProfileSection />
        <SkillsSection />
        <ExperienceTimeline />
      </div>
      <Footer />
    </PageTransition>
  );
}
