import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaExternalLinkAlt, FaGithub, FaArrowRight } from 'react-icons/fa';
import SectionWrapper from '../components/SectionWrapper';
import { CardSkeleton } from '../components/LoadingSkeleton';
import PageTransition from '../components/PageTransition';
import PageHeader from '../components/PageHeader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { publicApi } from '../api/client';
import './Projects.css';

const CATEGORY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'automation', label: 'Automation' },
  { value: 'other', label: 'Other' },
];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = activeFilter ? { category: activeFilter } : {};
    publicApi.getProjects(params)
      .then((res) => {
        const data = res.data.results || res.data;
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeFilter]);

  const handleProjectCardKeyDown = (event, project) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedProject(project);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Projects | Portfolio</title>
        <meta name="description" content="Explore my portfolio of projects spanning full-stack, backend, frontend, and automation." />
      </Helmet>

      <Navbar />

      <main id="main-content" style={{ paddingTop: '5rem' }}>
        <SectionWrapper>
          <div className="projects__header">
            <PageHeader
              badge="Case Studies"
              title="My"
              highlight="Projects"
              subtitle="A collection of things I've built, from full-stack apps to automation tools."
            />
          </div>

          <div className="projects__filters">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`projects__filter ${activeFilter === filter.value ? 'projects__filter--active' : ''}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="projects__grid">
              {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : projects.length > 0 ? (
            <motion.div className="projects__grid" layout>
              <AnimatePresence mode="popLayout">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    className="project-card glass"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open details for ${project.title}`}
                    aria-haspopup="dialog"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -8 }}
                    onClick={() => setSelectedProject(project)}
                    onKeyDown={(event) => handleProjectCardKeyDown(event, project)}
                  >
                    <div className="project-card__img">
                      <img
                        src={project.thumbnail || 'https://via.placeholder.com/600x400/16161f/7c3aed?text=Project'}
                        alt={project.title}
                        loading="lazy"
                      />
                      {project.is_featured && (
                        <span className="project-card__badge">Featured</span>
                      )}
                    </div>

                    <div className="project-card__body">
                      <div className="project-card__meta">
                        <span className="chip chip-active">{project.category}</span>
                        {project.date_built && (
                          <span className="project-card__date">{project.date_built}</span>
                        )}
                      </div>
                      <h3 className="project-card__title">{project.title}</h3>
                      <p className="project-card__desc">{project.short_description}</p>
                      <div className="project-card__tech">
                        {project.tech_stack?.slice(0, 4).map((skill) => (
                          <span key={skill.id} className="chip">{skill.name}</span>
                        ))}
                        {project.tech_stack?.length > 4 && (
                          <span className="chip">+{project.tech_stack.length - 4}</span>
                        )}
                      </div>
                      <div className="project-card__links">
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-card__link"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <FaExternalLinkAlt /> Live
                          </a>
                        )}
                        {project.repo_url && (
                          <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-card__link"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <FaGithub /> Code
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="projects__empty">
              <h3>No projects found</h3>
              <p className="section-subtitle">
                {activeFilter
                  ? 'Try selecting a different category.'
                  : 'Projects will appear here once added via the admin panel.'}
              </p>
            </div>
          )}
        </SectionWrapper>
      </main>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </PageTransition>
  );
}

function ProjectModal({ project, onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  useEffect(() => {
    previousActiveElementRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handler = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = modalRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = originalBodyOverflow;
      previousActiveElementRef.current?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        ref={modalRef}
        className="modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        aria-describedby="project-modal-description"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button ref={closeButtonRef} className="modal__close" onClick={onClose} aria-label="Close project details">
          X
        </button>

        <div className="modal__img">
          <img
            src={project.thumbnail || 'https://via.placeholder.com/800x400/16161f/7c3aed?text=Project'}
            alt={project.title}
          />
        </div>

        <div className="modal__body">
          <div className="modal__meta">
            <span className="chip chip-active">{project.category}</span>
            {project.is_featured && (
              <span className="chip" style={{ background: 'rgba(236,72,153,0.15)', borderColor: '#ec4899', color: '#ec4899' }}>
                Featured
              </span>
            )}
          </div>

          <h2 id="project-modal-title" className="modal__title">{project.title}</h2>

          <div id="project-modal-description" className="modal__description">
            {project.description?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            )) || <p>{project.short_description}</p>}
          </div>

          <div className="modal__tech">
            <h4>Technologies Used</h4>
            <div className="modal__tech-list">
              {project.tech_stack?.map((skill) => (
                <span key={skill.id} className="chip">{skill.name}</span>
              ))}
            </div>
          </div>

          <div className="modal__actions">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <FaExternalLinkAlt /> View Live <FaArrowRight />
              </a>
            )}
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <FaGithub /> View Code
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
