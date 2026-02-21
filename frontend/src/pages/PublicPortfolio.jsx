import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowDown,
  FaArrowRight,
  FaBriefcase,
  FaCalendarAlt,
  FaCertificate,
  FaClock,
  FaEnvelope,
  FaExternalLinkAlt,
  FaGithub,
  FaGraduationCap,
  FaLayerGroup,
  FaLinkedin,
  FaPaperPlane,
  FaQuoteLeft,
  FaStar,
  FaTachometerAlt,
  FaTimes,
  FaTrophy,
  FaTwitter,
  FaUsers,
} from 'react-icons/fa';
import { HiDownload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import SectionWrapper from '../components/SectionWrapper';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SkillIcon from '../components/SkillIcon';
import { publicApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './PublicPortfolio.css';
import './PortfolioShared.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

const toArray = (value) => {
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value)) return value;
  return [];
};

const formatDate = (value) => {
  if (!value) return 'Not specified';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not specified';
  return parsed.toLocaleDateString();
};

const formatPeriod = (startDate, endDate, isCurrent) => {
  if (!startDate && !endDate && !isCurrent) return 'Not specified';
  const start = startDate ? formatDate(startDate) : 'N/A';
  const end = isCurrent ? 'Present' : endDate ? formatDate(endDate) : 'N/A';
  return `${start} - ${end}`;
};

const getItemKey = (item) => item?.slug || item?.id;

export default function PublicPortfolio() {
  const { username } = useParams();
  const { isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [activities, setActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [projectDetailsById, setProjectDetailsById] = useState({});
  const [blogDetailsById, setBlogDetailsById] = useState({});
  const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);
  const [loadingBlogDetails, setLoadingBlogDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchPortfolioData = async () => {
      setLoading(true);
      setNotFound(false);
      setShowAllProjects(false);
      setShowAllBlogs(false);
      setShowAllTestimonials(false);
      setSelectedProject(null);
      setSelectedBlog(null);
      setSelectedTestimonial(null);
      setProjectDetailsById({});
      setBlogDetailsById({});
      setEducation([]);
      setActivities([]);
      setAchievements([]);
      setCertifications([]);

      try {
        const [
          profileRes,
          skillsRes,
          projectsRes,
          expRes,
          eduRes,
          activitiesRes,
          achievementsRes,
          certificationsRes,
          blogsRes,
          testimonialsRes,
        ] = await Promise.all([
          publicApi.getProfile(username),
          publicApi.getSkills(username).catch(() => ({ data: [] })),
          publicApi.getProjects(username).catch(() => ({ data: [] })),
          publicApi.getExperience(username).catch(() => ({ data: [] })),
          publicApi.getEducation(username).catch(() => ({ data: [] })),
          publicApi.getActivities(username).catch(() => ({ data: [] })),
          publicApi.getAchievements(username).catch(() => ({ data: [] })),
          publicApi.getCertifications(username).catch(() => ({ data: [] })),
          publicApi.getBlogs(username).catch(() => ({ data: [] })),
          publicApi.getTestimonials(username).catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        setProfile(profileRes.data);
        setSkills(toArray(skillsRes?.data));

        const projectsList = toArray(projectsRes?.data).sort((a, b) => {
          const leftOrder = Number(a.order) || 0;
          const rightOrder = Number(b.order) || 0;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return new Date(b.date_built || b.created_at || 0) - new Date(a.date_built || a.created_at || 0);
        });
        setProjects(projectsList);

        const experienceList = toArray(expRes?.data).sort((a, b) => {
          return new Date(b.start_date || 0) - new Date(a.start_date || 0);
        });
        setExperience(experienceList);

        const educationList = toArray(eduRes?.data).sort((a, b) => {
          const leftOrder = Number(a.order) || 0;
          const rightOrder = Number(b.order) || 0;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return new Date(b.start_date || 0) - new Date(a.start_date || 0);
        });
        setEducation(educationList);

        const activityList = toArray(activitiesRes?.data).sort((a, b) => {
          const leftOrder = Number(a.order) || 0;
          const rightOrder = Number(b.order) || 0;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return new Date(b.start_date || 0) - new Date(a.start_date || 0);
        });
        setActivities(activityList);

        const achievementList = toArray(achievementsRes?.data).sort((a, b) => {
          const leftOrder = Number(a.order) || 0;
          const rightOrder = Number(b.order) || 0;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return new Date(b.achieved_on || 0) - new Date(a.achieved_on || 0);
        });
        setAchievements(achievementList);

        const certificationList = toArray(certificationsRes?.data).sort((a, b) => {
          const leftOrder = Number(a.order) || 0;
          const rightOrder = Number(b.order) || 0;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return new Date(b.issue_date || 0) - new Date(a.issue_date || 0);
        });
        setCertifications(certificationList);

        const blogList = toArray(blogsRes?.data).sort((a, b) => {
          return new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0);
        });
        setBlogs(blogList);

        const testimonialsList = toArray(testimonialsRes?.data).sort((a, b) => {
          const leftOrder = Number(a.order) || 0;
          const rightOrder = Number(b.order) || 0;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });
        setTestimonials(testimonialsList);
      } catch {
        if (!cancelled) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPortfolioData();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const isModalOpen = Boolean(selectedProject || selectedBlog || selectedTestimonial);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setSelectedProject(null);
        setSelectedBlog(null);
        setSelectedTestimonial(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen]);

  const latestProject = projects[0] || null;
  const latestBlog = blogs[0] || null;
  const averageRating = testimonials.length
    ? (testimonials.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / testimonials.length).toFixed(1)
    : '0.0';
  const skillCount = skills.reduce((total, category) => total + (category.skills?.length || 0), 0);
  const isSectionVisible = (key) => profile?.[key] !== false;
  const showHero = isSectionVisible('show_hero');
  const showAbout = isSectionVisible('show_about');
  const showHighlights = isSectionVisible('show_highlights');
  const showSkills = isSectionVisible('show_skills');
  const showProjects = isSectionVisible('show_projects');
  const showExperience = isSectionVisible('show_experience');
  const showEducation = isSectionVisible('show_education');
  const showActivities = isSectionVisible('show_activities');
  const showAchievements = isSectionVisible('show_achievements');
  const showCertifications = isSectionVisible('show_certifications');
  const showBlog = isSectionVisible('show_blog');
  const showTestimonials = isSectionVisible('show_testimonials');
  const showContact = isSectionVisible('show_contact');
  const isNavVisible = (key) => profile?.[key] !== false;
  const showNavAbout = isNavVisible('show_nav_about');
  const showNavSkills = isNavVisible('show_nav_skills');
  const showNavProjects = isNavVisible('show_nav_projects');
  const showNavExperience = isNavVisible('show_nav_experience');
  const showNavEducation = isNavVisible('show_nav_education');
  const showNavActivities = isNavVisible('show_nav_activities');
  const showNavAchievements = isNavVisible('show_nav_achievements');
  const showNavCertifications = isNavVisible('show_nav_certifications');
  const showNavBlog = isNavVisible('show_nav_blog');
  const showNavTestimonials = isNavVisible('show_nav_testimonials');
  const showNavContact = isNavVisible('show_nav_contact');

  const visibleProjects = useMemo(
    () => (showAllProjects ? projects : projects.slice(0, 3)),
    [projects, showAllProjects]
  );
  const visibleBlogs = useMemo(
    () => (showAllBlogs ? blogs : blogs.slice(0, 3)),
    [blogs, showAllBlogs]
  );
  const visibleTestimonials = useMemo(
    () => (showAllTestimonials ? testimonials : testimonials.slice(0, 3)),
    [testimonials, showAllTestimonials]
  );

  const navSections = useMemo(() => ([
    { key: 'about', label: 'About', show: showAbout && showNavAbout },
    { key: 'skills', label: 'Skills', show: showSkills && skillCount > 0 && showNavSkills },
    { key: 'projects', label: 'Projects', show: showProjects && projects.length > 0 && showNavProjects },
    { key: 'experience', label: 'Experience', show: showExperience && experience.length > 0 && showNavExperience },
    { key: 'education', label: 'Education', show: showEducation && education.length > 0 && showNavEducation },
    { key: 'activities', label: 'Activities', show: showActivities && activities.length > 0 && showNavActivities },
    { key: 'achievements', label: 'Achievements', show: showAchievements && achievements.length > 0 && showNavAchievements },
    { key: 'certifications', label: 'Certifications', show: showCertifications && certifications.length > 0 && showNavCertifications },
    { key: 'blog', label: 'Articles', show: showBlog && blogs.length > 0 && showNavBlog },
    { key: 'testimonials', label: 'Testimonials', show: showTestimonials && testimonials.length > 0 && showNavTestimonials },
    { key: 'contact', label: 'Contact', show: showContact && showNavContact },
  ]).filter((item) => item.show), [
    showAbout,
    showSkills,
    showProjects,
    showExperience,
    showEducation,
    showActivities,
    showAchievements,
    showCertifications,
    showBlog,
    showTestimonials,
    showContact,
    showNavAbout,
    showNavSkills,
    showNavProjects,
    showNavExperience,
    showNavEducation,
    showNavActivities,
    showNavAchievements,
    showNavCertifications,
    showNavBlog,
    showNavTestimonials,
    showNavContact,
    skillCount,
    projects.length,
    experience.length,
    education.length,
    activities.length,
    achievements.length,
    certifications.length,
    blogs.length,
    testimonials.length,
  ]);

  const openProjectDetails = async (project) => {
    setSelectedProject(project);
    const key = getItemKey(project);
    if (!key || projectDetailsById[key]) return;

    setLoadingProjectDetails(true);
    try {
      const response = await publicApi.getProjectBySlug(username, String(key));
      setProjectDetailsById((prev) => ({ ...prev, [key]: response.data }));
    } catch {
      // Keep preview-only data when detail endpoint is unavailable.
    } finally {
      setLoadingProjectDetails(false);
    }
  };

  const openBlogDetails = async (blog) => {
    setSelectedBlog(blog);
    const key = getItemKey(blog);
    if (!key || blogDetailsById[key]) return;

    setLoadingBlogDetails(true);
    try {
      const response = await publicApi.getBlogBySlug(username, String(key));
      setBlogDetailsById((prev) => ({ ...prev, [key]: response.data }));
    } catch {
      // Keep preview-only data when detail endpoint is unavailable.
    } finally {
      setLoadingBlogDetails(false);
    }
  };

  if (notFound) {
    return (
      <div className="portfolio-not-found">
        <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Portfolio Not Found</h1>
          <p>
            No portfolio exists for <strong>@{username}</strong>.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </Motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="portfolio-loading">
        <LoadingSkeleton variant="title" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile?.full_name || username} | Portfolio</title>
        <meta name="description" content={profile?.tagline || `${profile?.full_name || username} portfolio`} />
      </Helmet>

      <nav className="portfolio-nav">
        <span className="portfolio-nav__name gradient-text">{profile?.full_name || username}</span>
        <div className="portfolio-nav__links">
          {navSections.map((section) => (
            <a key={section.key} href={`#${section.key}`}>{section.label}</a>
          ))}
          {isAuthenticated && (
            <Link to="/user/dashboard" className="btn btn-primary btn-sm">
              <FaTachometerAlt /> Dashboard
            </Link>
          )}
        </div>
      </nav>

      {showHero && (
      <section className="hero" id="hero" style={{ paddingTop: '5rem' }}>
        <div className="hero__orbs">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
        </div>
        <div className="container hero__content">
          <Motion.div
            className="hero__text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Motion.p
              className="hero__greeting"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Hello, I&apos;m
            </Motion.p>
            <h1 className="hero__name">
              <span className="gradient-text">{profile?.full_name || username}</span>
            </h1>
            <Motion.p className="hero__tagline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {profile?.tagline || 'Developer and creator'}
            </Motion.p>
            <Motion.p className="hero__bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {profile?.bio?.slice(0, 220) || 'Building reliable products with strong UX and clean engineering.'}
              {profile?.bio && profile.bio.length > 220 ? '...' : ''}
            </Motion.p>
            <Motion.div
              className="hero__actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <a href="#projects" className="btn btn-primary btn-lg">
                Explore Work
              </a>
              {profile?.resume && (
                <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
                  <HiDownload /> Resume
                </a>
              )}
              <a href="#contact" className="btn btn-outline btn-lg">
                Contact
              </a>
            </Motion.div>
            <Motion.div className="hero__socials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
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
              {profile?.twitter_url && (
                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FaTwitter size={22} />
                </a>
              )}
              {profile?.email && (
                <a href={`mailto:${profile.email}`} aria-label="Email">
                  <FaEnvelope size={22} />
                </a>
              )}
            </Motion.div>
          </Motion.div>

          <Motion.div
            className="hero__visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="hero__card glass">
              <div className="hero__card-dots">
                <span />
                <span />
                <span />
              </div>
              <pre className="hero__code">{`const profile = {
  name: "${profile?.full_name || username}",
  projects: ${projects.length},
  articles: ${blogs.length},
  skills: ${skillCount},
  credibility: ${averageRating}/5
};`}</pre>
            </div>
          </Motion.div>
        </div>

        <Motion.a href="#about" className="hero__scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <FaArrowDown className="hero__scroll-arrow" />
        </Motion.a>
      </section>
      )}

      {showAbout && (
      <SectionWrapper id="about" className="about-preview">
        <div className="about-preview__grid">
          <Motion.div className="about-preview__image" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="about-preview__img-wrapper glass">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile?.full_name || username} />
              ) : (
                <div className="about-preview__placeholder">
                  <span className="gradient-text portfolio-avatar-fallback">
                    {(profile?.full_name || username || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </Motion.div>
          <Motion.div className="about-preview__content" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="section-title">
              About <span className="gradient-text">Me</span>
            </h2>
            <p className="about-preview__text">{profile?.bio || 'No bio added yet.'}</p>
            <div className="about-preview__highlights">
              <div className="about-preview__stat glass">
                <span className="about-preview__stat-value gradient-text">{projects.length}</span>
                <span className="about-preview__stat-label">Projects</span>
              </div>
              <div className="about-preview__stat glass">
                <span className="about-preview__stat-value gradient-text">{skillCount}</span>
                <span className="about-preview__stat-label">Skills</span>
              </div>
              <div className="about-preview__stat glass">
                <span className="about-preview__stat-value gradient-text">{experience.length}</span>
                <span className="about-preview__stat-label">Experience</span>
              </div>
            </div>
          </Motion.div>
        </div>
      </SectionWrapper>
      )}

      {showHighlights && (
      <SectionWrapper className="portfolio-insights" id="highlights">
        <div className="portfolio-section__header">
          <div>
            <h2 className="section-title">
              Important <span className="gradient-text">Now</span>
            </h2>
            <p className="section-subtitle">
              Quick snapshot of latest public activity and portfolio depth.
            </p>
          </div>
        </div>
        <div className="portfolio-insights__grid">
          <a href="#projects" className="portfolio-insight-card glass">
            <span className="chip portfolio-chip-icon">
              <FaBriefcase />
              Latest Project
            </span>
            <h3>{latestProject?.title || 'No projects yet'}</h3>
            <p>{latestProject?.short_description || latestProject?.description || 'Add projects to showcase your latest work.'}</p>
          </a>
          <a href="#blog" className="portfolio-insight-card glass">
            <span className="chip portfolio-chip-icon">
              <FaClock />
              Latest Article
            </span>
            <h3>{latestBlog?.title || 'No articles yet'}</h3>
            <p>{latestBlog?.excerpt || 'Publish articles to show your thought process and technical depth.'}</p>
          </a>
          <a href="#testimonials" className="portfolio-insight-card glass">
            <span className="chip portfolio-chip-icon">
              <FaStar />
              Social Proof
            </span>
            <h3>{averageRating}/5 average rating</h3>
            <p>{testimonials.length} testimonial{testimonials.length === 1 ? '' : 's'} published.</p>
          </a>
          <a href="#contact" className="portfolio-insight-card glass">
            <span className="chip portfolio-chip-icon">
              <FaArrowRight />
              Portfolio Coverage
            </span>
            <h3>{projects.length + blogs.length + testimonials.length + education.length + activities.length + achievements.length + certifications.length} public items</h3>
            <p>Projects, articles, and testimonials are now browsable in-page.</p>
          </a>
        </div>
      </SectionWrapper>
      )}

      {showSkills && skills.length > 0 && (
        <SectionWrapper id="skills" className="skills-home">
          <div className="skills-home__header">
            <h2 className="section-title">
              Skills and <span className="gradient-text">Technologies</span>
            </h2>
          </div>
          <div className="skills-home__grid">
            {skills.map((category, index) => (
              <Motion.div
                key={category.id || `${category.name}-${index}`}
                className="skills-home__category glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={index}
                viewport={{ once: true }}
              >
                <h3 className="skills-home__cat-name">
                  <FaLayerGroup />
                  {category.name}
                </h3>
                <div className="skills-home__list">
                  {category.skills?.map((skill) => (
                    <span key={skill.id || skill.name} className="chip">
                      <SkillIcon
                        name={skill.name}
                        iconUrl={skill.icon}
                        className="skills-home__icon"
                        fallbackClassName="skills-home__icon--fallback"
                      />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </Motion.div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {showProjects && (
      <SectionWrapper id="projects">
        <div className="portfolio-section__header">
          <div>
            <h2 className="section-title">
              My <span className="gradient-text">Projects</span>
            </h2>
            <p className="section-subtitle">Open any card to view full project details without leaving this page.</p>
          </div>
          {projects.length > 3 && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAllProjects((prev) => !prev)}>
              {showAllProjects ? 'Show Less' : `View All (${projects.length})`}
            </button>
          )}
        </div>
        {projects.length > 0 ? (
          <div className="featured__grid">
            {visibleProjects.map((project, index) => (
              <Motion.article
                key={project.id || project.slug}
                className="featured__card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={index}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
              >
                <div className="featured__card-img">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} loading="lazy" />
                  ) : (
                    <div className="portfolio-empty-box">
                      <span>{(project.title || 'P').charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="featured__card-body">
                  <div className="portfolio-meta-inline">
                    {project.category && <span className="chip">{project.category}</span>}
                    {project.date_built && (
                      <span className="chip">
                        <FaCalendarAlt />
                        {formatDate(project.date_built)}
                      </span>
                    )}
                  </div>
                  <h3 className="featured__card-title">{project.title}</h3>
                  <p className="featured__card-desc">{project.short_description || project.description || 'No summary available.'}</p>
                  {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
                    <div className="featured__card-tech">
                      {project.tech_stack.slice(0, 5).map((skill) => (
                        <span key={skill.id || skill.name} className="chip">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="portfolio-card__details">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openProjectDetails(project)}>
                      Read Details <FaArrowRight />
                    </button>
                    <div className="portfolio-card__links">
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="chip">
                          <FaExternalLinkAlt />
                          Live
                        </a>
                      )}
                      {project.repo_url && (
                        <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="chip">
                          <FaGithub />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Motion.article>
            ))}
          </div>
        ) : (
          <div className="portfolio-empty-box">No public projects yet.</div>
        )}
      </SectionWrapper>
      )}

      {showExperience && experience.length > 0 && (
        <SectionWrapper id="experience" className="exp-home">
          <div className="exp-home__header">
            <h2 className="section-title">
              Work <span className="gradient-text">Experience</span>
            </h2>
          </div>
          <div className="exp-home__list">
            {experience.map((item, index) => (
              <Motion.article
                key={item.id || `${item.role}-${index}`}
                className="exp-home__item glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={index}
                viewport={{ once: true }}
              >
                <div className="exp-home__dot" />
                <div className="exp-home__content">
                  <div className="exp-home__top">
                    <div>
                      <h3 className="exp-home__role">{item.role}</h3>
                      <span className="exp-home__company">
                        <FaBriefcase className="exp-home__icon" /> {item.company}
                      </span>
                    </div>
                    <div className="exp-home__meta">
                      <span className="chip">
                        <FaCalendarAlt style={{ fontSize: '0.6rem' }} />
                        {item.start_date} - {item.is_current ? 'Present' : item.end_date}
                      </span>
                      {item.duration && <span className="chip chip-active">{item.duration}</span>}
                    </div>
                  </div>
                  {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                    <ul className="exp-home__highlights">
                      {item.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </Motion.article>
            ))}
          </div>
        </SectionWrapper>
      )}

      {showEducation && education.length > 0 && (
        <SectionWrapper id="education">
          <div className="portfolio-section__header">
            <div>
              <h2 className="section-title">
                Academic <span className="gradient-text">Education</span>
              </h2>
              <p className="section-subtitle">Degrees, institutions, and focused areas of study.</p>
            </div>
          </div>
          <div className="portfolio-cred-grid">
            {education.map((item, index) => (
              <Motion.article
                key={item.id || `${item.institution}-${index}`}
                className="portfolio-cred-card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={index}
                viewport={{ once: true }}
              >
                <div className="portfolio-cred-card__icon"><FaGraduationCap /></div>
                <h3>{item.degree}</h3>
                <p className="portfolio-cred-card__subtitle">{item.institution}</p>
                <div className="portfolio-cred-card__meta">
                  <span className="chip"><FaCalendarAlt /> {item.duration || formatPeriod(item.start_date, item.end_date, item.is_current)}</span>
                  {item.field_of_study && <span className="chip">{item.field_of_study}</span>}
                  {item.grade && <span className="chip">Grade: {item.grade}</span>}
                </div>
                {item.description && <p className="portfolio-cred-card__text">{item.description}</p>}
              </Motion.article>
            ))}
          </div>
        </SectionWrapper>
      )}

      {showActivities && activities.length > 0 && (
        <SectionWrapper id="activities">
          <div className="portfolio-section__header">
            <div>
              <h2 className="section-title">
                Extracurricular <span className="gradient-text">Activities</span>
              </h2>
              <p className="section-subtitle">Community, leadership, and collaborative initiatives beyond work.</p>
            </div>
          </div>
          <div className="portfolio-cred-grid">
            {activities.map((item, index) => (
              <Motion.article
                key={item.id || `${item.title}-${index}`}
                className="portfolio-cred-card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={index}
                viewport={{ once: true }}
              >
                <div className="portfolio-cred-card__icon"><FaUsers /></div>
                <h3>{item.title}</h3>
                <p className="portfolio-cred-card__subtitle">
                  {[item.role, item.organization].filter(Boolean).join(' at ') || 'Extracurricular'}
                </p>
                <div className="portfolio-cred-card__meta">
                  <span className="chip"><FaCalendarAlt /> {item.duration || formatPeriod(item.start_date, item.end_date, item.is_current)}</span>
                </div>
                {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                  <div className="portfolio-cred-card__chips">
                    {item.highlights.slice(0, 4).map((highlight, i) => (
                      <span key={`${highlight}-${i}`} className="chip">{highlight}</span>
                    ))}
                  </div>
                )}
                {item.description && <p className="portfolio-cred-card__text">{item.description}</p>}
              </Motion.article>
            ))}
          </div>
        </SectionWrapper>
      )}

      {showAchievements && achievements.length > 0 && (
        <SectionWrapper id="achievements">
          <div className="portfolio-section__header">
            <div>
              <h2 className="section-title">
                Notable <span className="gradient-text">Achievements</span>
              </h2>
              <p className="section-subtitle">Awards, milestones, and outcomes delivered over time.</p>
            </div>
          </div>
          <div className="portfolio-cred-grid">
            {achievements.map((item, index) => (
              <Motion.article
                key={item.id || `${item.title}-${index}`}
                className="portfolio-cred-card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={index}
                viewport={{ once: true }}
              >
                <div className="portfolio-cred-card__icon"><FaTrophy /></div>
                <h3>{item.title}</h3>
                <p className="portfolio-cred-card__subtitle">{item.issuer || 'Achievement'}</p>
                <div className="portfolio-cred-card__meta">
                  {item.achieved_on && (
                    <span className="chip"><FaCalendarAlt /> {formatDate(item.achieved_on)}</span>
                  )}
                </div>
                {item.description && <p className="portfolio-cred-card__text">{item.description}</p>}
                {item.proof_url && (
                  <div className="portfolio-card__links">
                    <a href={item.proof_url} target="_blank" rel="noopener noreferrer" className="chip">
                      <FaExternalLinkAlt /> Proof
                    </a>
                  </div>
                )}
              </Motion.article>
            ))}
          </div>
        </SectionWrapper>
      )}

      {showCertifications && certifications.length > 0 && (
        <SectionWrapper id="certifications">
          <div className="portfolio-section__header">
            <div>
              <h2 className="section-title">
                Professional <span className="gradient-text">Certifications</span>
              </h2>
              <p className="section-subtitle">Verified credentials that support technical and domain expertise.</p>
            </div>
          </div>
          <div className="portfolio-cred-grid">
            {certifications.map((item, index) => (
              <Motion.article
                key={item.id || `${item.name}-${index}`}
                className="portfolio-cred-card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={index}
                viewport={{ once: true }}
              >
                <div className="portfolio-cred-card__icon"><FaCertificate /></div>
                <h3>{item.name}</h3>
                <p className="portfolio-cred-card__subtitle">{item.issuer || 'Certification'}</p>
                <div className="portfolio-cred-card__meta">
                  <span className="chip">
                    <FaCalendarAlt /> {item.validity || formatPeriod(item.issue_date, item.expiry_date, false)}
                  </span>
                  {item.credential_id && <span className="chip">{item.credential_id}</span>}
                </div>
                {Array.isArray(item.skills) && item.skills.length > 0 && (
                  <div className="portfolio-cred-card__chips">
                    {item.skills.slice(0, 5).map((skill, i) => (
                      <span key={`${skill}-${i}`} className="chip">{skill}</span>
                    ))}
                  </div>
                )}
                {item.credential_url && (
                  <div className="portfolio-card__links">
                    <a href={item.credential_url} target="_blank" rel="noopener noreferrer" className="chip">
                      <FaExternalLinkAlt /> Verify
                    </a>
                  </div>
                )}
              </Motion.article>
            ))}
          </div>
        </SectionWrapper>
      )}

      {showBlog && (
      <SectionWrapper id="blog">
        <div className="portfolio-section__header">
          <div>
            <h2 className="section-title">
              Latest <span className="gradient-text">Articles</span>
            </h2>
            <p className="section-subtitle">Expanded article cards and modal reading view for better content discovery.</p>
          </div>
          {blogs.length > 3 && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAllBlogs((prev) => !prev)}>
              {showAllBlogs ? 'Show Less' : `View All (${blogs.length})`}
            </button>
          )}
        </div>
        {blogs.length > 0 ? (
          <div className="featured__grid">
            {visibleBlogs.map((blog, index) => (
              <Motion.article
                key={blog.id || blog.slug}
                className="featured__card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={index}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
              >
                <div className="featured__card-img">
                  {blog.thumbnail ? (
                    <img src={blog.thumbnail} alt={blog.title} loading="lazy" />
                  ) : (
                    <div className="portfolio-empty-box">
                      <span>{(blog.title || 'A').charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="featured__card-body">
                  <div className="portfolio-meta-inline">
                    <span className="chip">
                      <FaCalendarAlt />
                      {formatDate(blog.published_at || blog.created_at)}
                    </span>
                    <span className="chip">
                      <FaClock />
                      {blog.read_time || '5 min read'}
                    </span>
                  </div>
                  <h3 className="featured__card-title">{blog.title}</h3>
                  <p className="featured__card-desc">{blog.excerpt || 'No excerpt available.'}</p>
                  {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                    <div className="featured__card-tech">
                      {blog.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="portfolio-card__details">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openBlogDetails(blog)}>
                      Read Article <FaArrowRight />
                    </button>
                  </div>
                </div>
              </Motion.article>
            ))}
          </div>
        ) : (
          <div className="portfolio-empty-box">No public articles yet.</div>
        )}
      </SectionWrapper>
      )}

      {showTestimonials && (
      <SectionWrapper id="testimonials">
        <div className="portfolio-section__header">
          <div>
            <h2 className="section-title">
              Client <span className="gradient-text">Testimonials</span>
            </h2>
            <p className="section-subtitle">Readable cards and full-story modal view for social proof.</p>
          </div>
          {testimonials.length > 3 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAllTestimonials((prev) => !prev)}
            >
              {showAllTestimonials ? 'Show Less' : `View All (${testimonials.length})`}
            </button>
          )}
        </div>
        {testimonials.length > 0 ? (
          <div className="featured__grid">
            {visibleTestimonials.map((item, index) => {
              const rating = Math.max(0, Math.min(5, Number(item.rating) || 0));
              const name = item.client_name || 'Client';
              return (
                <Motion.article
                  key={item.id || `${name}-${index}`}
                  className="portfolio-testimonial-card glass"
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeUp}
                  custom={index}
                  viewport={{ once: true }}
                  whileHover={{ y: -6 }}
                >
                  <div className="portfolio-testimonial-card__head">
                    <div className="portfolio-testimonial-card__avatar">
                      {item.client_avatar ? (
                        <img src={item.client_avatar} alt={name} />
                      ) : (
                        <span>{name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3>{name}</h3>
                      <p>
                        {[item.client_role, item.client_company].filter(Boolean).join(' at ') || 'Verified client'}
                      </p>
                    </div>
                  </div>
                  <div className="portfolio-testimonial-card__rating">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <FaStar key={`${name}-${starIndex}`} className={starIndex < rating ? 'active' : ''} />
                    ))}
                    <span>{rating.toFixed(1)}</span>
                  </div>
                  <p className="portfolio-testimonial-card__content">{item.content || 'No testimonial content.'}</p>
                  <div className="portfolio-card__details">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedTestimonial(item)}>
                      Read Story <FaArrowRight />
                    </button>
                    {item.project_name && <span className="chip">Project: {item.project_name}</span>}
                  </div>
                </Motion.article>
              );
            })}
          </div>
        ) : (
          <div className="portfolio-empty-box">No public testimonials yet.</div>
        )}
      </SectionWrapper>
      )}

      {showContact && <ContactSection username={username} profileName={profile?.full_name} />}

      <footer className="portfolio-footer">
        Built with <span className="gradient-text">PortfolioHub</span> | {new Date().getFullYear()} {profile?.full_name || username}
      </footer>

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailsModal
            project={projectDetailsById[getItemKey(selectedProject)] || selectedProject}
            loading={loadingProjectDetails}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBlog && (
          <BlogDetailsModal
            blog={blogDetailsById[getItemKey(selectedBlog)] || selectedBlog}
            loading={loadingBlogDetails}
            onClose={() => setSelectedBlog(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTestimonial && (
          <TestimonialDetailsModal testimonial={selectedTestimonial} onClose={() => setSelectedTestimonial(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function ContactSection({ username, profileName }) {
  const [form, setForm] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    content: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.sender_name || !form.sender_email || !form.content) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSending(true);
    try {
      await publicApi.sendMessage(username, form);
      setSent(true);
      setForm({ sender_name: '', sender_email: '', subject: '', content: '' });
      toast.success('Message sent successfully.');
    } catch {
      toast.error('Message failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SectionWrapper id="contact">
      <h2 className="section-title portfolio-center-text">
        Get In <span className="gradient-text">Touch</span>
      </h2>
      <p className="section-subtitle portfolio-center-text portfolio-contact-subtitle">
        Ask a question, request collaboration, or discuss your next project.
      </p>

      <div className="portfolio-contact">
        {sent ? (
          <Motion.div
            className="portfolio-contact-success glass"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="portfolio-contact-success__icon">Sent</div>
            <h3>Message Delivered</h3>
            <p>
              Thanks for reaching out to {profileName || username}. You should receive a response soon.
            </p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSent(false)}>
              Send Another Message
            </button>
          </Motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="portfolio-contact__form">
            <div className="portfolio-contact__row">
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">
                  Name *
                </label>
                <input
                  id="contact-name"
                  className="form-input"
                  value={form.sender_name}
                  onChange={updateField('sender_name')}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">
                  Email *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-input"
                  value={form.sender_email}
                  onChange={updateField('sender_email')}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-subject">
                Subject
              </label>
              <input
                id="contact-subject"
                className="form-input"
                value={form.subject}
                onChange={updateField('subject')}
                placeholder="Project discussion, collaboration, question..."
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">
                Message *
              </label>
              <textarea
                id="contact-message"
                className="form-input"
                value={form.content}
                onChange={updateField('content')}
                placeholder="Tell me what you are looking for..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
              {sending ? 'Sending...' : <><FaPaperPlane /> Send Message</>}
            </button>
          </form>
        )}
      </div>
    </SectionWrapper>
  );
}

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <Motion.div className="portfolio-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <Motion.div
        className="portfolio-modal__panel glass"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="portfolio-modal__header">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="portfolio-modal__close" onClick={onClose} aria-label="Close details">
            <FaTimes />
          </button>
        </div>
        <div className="portfolio-modal__content">{children}</div>
      </Motion.div>
    </Motion.div>
  );
}

function ProjectDetailsModal({ project, loading, onClose }) {
  const description = project?.description || project?.short_description || 'No project description available.';
  return (
    <ModalShell
      title={project?.title || 'Project details'}
      subtitle={[project?.category, project?.date_built ? formatDate(project.date_built) : null].filter(Boolean).join(' | ')}
      onClose={onClose}
    >
      {loading && <p>Loading latest project details...</p>}
      {!loading && (
        <>
          {project?.thumbnail && <img src={project.thumbnail} alt={project.title} className="portfolio-modal__media" />}
          <p>{description}</p>
          {Array.isArray(project?.tech_stack) && project.tech_stack.length > 0 && (
            <div className="portfolio-modal__chips">
              {project.tech_stack.map((skill) => (
                <span key={skill.id || skill.name} className="chip">
                  {skill.name}
                </span>
              ))}
            </div>
          )}
          <div className="portfolio-modal__actions">
            {project?.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                <FaExternalLinkAlt /> View Live
              </a>
            )}
            {project?.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                <FaGithub /> View Code
              </a>
            )}
          </div>
        </>
      )}
    </ModalShell>
  );
}

function BlogDetailsModal({ blog, loading, onClose }) {
  const content = blog?.content || blog?.excerpt || 'No article content available.';
  return (
    <ModalShell
      title={blog?.title || 'Article details'}
      subtitle={`${formatDate(blog?.published_at || blog?.created_at)} | ${blog?.read_time || '5 min read'}`}
      onClose={onClose}
    >
      {loading && <p>Loading latest article details...</p>}
      {!loading && (
        <>
          {blog?.thumbnail && <img src={blog.thumbnail} alt={blog.title} className="portfolio-modal__media" />}
          <div className="portfolio-modal__article">
            {(content || '')
              .split('\n')
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>
          {Array.isArray(blog?.tags) && blog.tags.length > 0 && (
            <div className="portfolio-modal__chips">
              {blog.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </ModalShell>
  );
}

function TestimonialDetailsModal({ testimonial, onClose }) {
  const rating = Math.max(0, Math.min(5, Number(testimonial?.rating) || 0));
  const author = testimonial?.client_name || 'Client';
  return (
    <ModalShell
      title={author}
      subtitle={[testimonial?.client_role, testimonial?.client_company].filter(Boolean).join(' at ') || 'Verified client'}
      onClose={onClose}
    >
      <div className="portfolio-modal__testimonial">
        <div className="portfolio-modal__quote">
          <FaQuoteLeft />
        </div>
        <div className="portfolio-testimonial-card__rating">
          {Array.from({ length: 5 }).map((_, index) => (
            <FaStar key={`${author}-${index}`} className={index < rating ? 'active' : ''} />
          ))}
          <span>{rating.toFixed(1)}</span>
        </div>
        <p>{testimonial?.content || 'No testimonial text available.'}</p>
        {testimonial?.project_name && <span className="chip">Project: {testimonial.project_name}</span>}
      </div>
    </ModalShell>
  );
}

