import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaCheckCircle,
  FaCopy,
  FaEnvelope,
  FaExternalLinkAlt,
  FaFileAlt,
  FaImage,
  FaLayerGroup,
  FaPaperPlane,
  FaProjectDiagram,
  FaQuoteLeft,
  FaStar,
  FaTimesCircle,
  FaUser,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import { useAuth } from '../../context/useAuth';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const unwrapCollection = (response) => {
  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const buildSectionStates = (profile, content) => {
  const skillCount = content.skills.length;
  const visibleProjects = content.projects.filter((item) => item?.is_visible !== false);
  const hasAbout =
    Boolean(profile?.bio?.trim())
    || Boolean(profile?.tagline?.trim())
    || Boolean(profile?.avatar)
    || skillCount > 0
    || visibleProjects.length > 0
    || content.experience.length > 0;
  const sections = [
    { id: 'hero', label: 'Hero', active: profile?.show_hero !== false },
    { id: 'about', label: 'About', active: profile?.show_about !== false && hasAbout },
    { id: 'skills', label: 'Skills', active: profile?.show_skills !== false && skillCount > 0 },
    { id: 'projects', label: 'Projects', active: profile?.show_projects !== false && visibleProjects.length > 0 },
    { id: 'experience', label: 'Experience', active: profile?.show_experience !== false && content.experience.length > 0 },
    { id: 'education', label: 'Education', active: profile?.show_education !== false && content.education.length > 0 },
    { id: 'activities', label: 'Activities', active: profile?.show_activities !== false && content.activities.length > 0 },
    { id: 'achievements', label: 'Achievements', active: profile?.show_achievements !== false && content.achievements.length > 0 },
    { id: 'certifications', label: 'Certifications', active: profile?.show_certifications !== false && content.certifications.length > 0 },
    { id: 'blog', label: 'Articles', active: profile?.show_blog !== false && content.blogs.filter((item) => item?.is_published).length > 0 },
    { id: 'testimonials', label: 'Testimonials', active: profile?.show_testimonials !== false && content.testimonials.length > 0 },
    { id: 'contact', label: 'Contact', active: profile?.show_contact !== false },
  ];

  return sections;
};

const PORTFOLIO_ACCESS_COPY = {
  public: {
    label: 'Public',
    description: 'Search engines may index this portfolio.',
    urlLabel: 'Share URL',
  },
  unlisted: {
    label: 'Unlisted',
    description: 'Direct link works, but search engines receive noindex.',
    urlLabel: 'Unlisted URL',
  },
  private: {
    label: 'Private',
    description: 'Only you can open it while logged in.',
    urlLabel: 'Owner preview URL',
  },
};

const readinessDefinitions = (state) => [
  {
    id: 'basics',
    title: 'Profile basics are complete',
    description: 'Name, email, and tagline should be filled before sharing the portfolio.',
    path: '/user/profile',
    action: 'Edit profile',
    status: Boolean(state.profile?.full_name?.trim() && state.profile?.email?.trim() && state.profile?.tagline?.trim()),
    required: true,
    icon: <FaUser />,
  },
  {
    id: 'bio-avatar',
    title: 'Identity is polished',
    description: 'A bio and avatar make the public page feel intentional instead of unfinished.',
    path: '/user/profile',
    action: 'Polish identity',
    status: Boolean(state.profile?.bio?.trim() && state.profile?.avatar),
    required: false,
    icon: <FaImage />,
  },
  {
    id: 'projects',
    title: 'Visible project proof exists',
    description: 'At least one visible project is the minimum bar before sending the portfolio anywhere.',
    path: '/user/projects',
    action: 'Manage projects',
    status: state.visibleProjects.length > 0,
    required: true,
    icon: <FaProjectDiagram />,
  },
  {
    id: 'skills',
    title: 'Core skills are listed',
    description: 'Add at least 5 skills so visitors can understand your stack at a glance.',
    path: '/user/skills',
    action: 'Update skills',
    status: state.content.skills.length >= 5,
    required: true,
    icon: <FaLayerGroup />,
  },
  {
    id: 'contact',
    title: 'Visitors can contact you',
    description: 'Keep the public contact section enabled and maintain at least one direct contact method.',
    path: '/user/profile?view=visibility',
    action: 'Review contact',
    status: Boolean(
      state.profile?.show_contact !== false
      && (state.profile?.email?.trim() || state.profile?.phone?.trim() || state.profile?.website_url?.trim())
    ),
    required: true,
    icon: <FaEnvelope />,
  },
  {
    id: 'resume',
    title: 'Resume is available',
    description: 'A downloadable resume adds confidence and gives recruiters another format to review.',
    path: '/user/profile?view=resume',
    action: 'Open resume',
    status: Boolean(state.profile?.resume || state.profile?.resume_download_url),
    required: false,
    icon: <FaFileAlt />,
  },
  {
    id: 'proof',
    title: 'Trust signals exist',
    description: 'Testimonials, milestones, or published articles make the portfolio feel complete.',
    path: state.content.testimonials.length === 0 ? '/user/testimonials' : state.content.blogs.filter((item) => item?.is_published).length === 0 ? '/user/blog' : '/user/milestones?section=education',
    action: 'Add trust signal',
    status: Boolean(
      state.content.testimonials.length
      || state.content.education.length
      || state.content.activities.length
      || state.content.achievements.length
      || state.content.certifications.length
      || state.content.blogs.filter((item) => item?.is_published).length
    ),
    required: false,
    icon: <FaStar />,
  },
];

export default function AdminPublish() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [content, setContent] = useState({
    skills: [],
    projects: [],
    experience: [],
    education: [],
    activities: [],
    achievements: [],
    certifications: [],
    blogs: [],
    testimonials: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          userApi.getProfile(),
          userApi.getSkills(),
          userApi.getProjects(),
          userApi.getExperience(),
          userApi.getEducation(),
          userApi.getActivities(),
          userApi.getAchievements(),
          userApi.getCertifications(),
          userApi.getBlogs(),
          userApi.getTestimonials(),
        ]);

        if (!isMounted) return;

        const [
          profileResult,
          skillsResult,
          projectsResult,
          experienceResult,
          educationResult,
          activitiesResult,
          achievementsResult,
          certificationsResult,
          blogsResult,
          testimonialsResult,
        ] = results;

        if (profileResult.status !== 'fulfilled') {
          throw profileResult.reason;
        }

        setProfile(profileResult.value?.data || null);
        setContent({
          skills: skillsResult.status === 'fulfilled' ? unwrapCollection(skillsResult.value) : [],
          projects: projectsResult.status === 'fulfilled' ? unwrapCollection(projectsResult.value) : [],
          experience: experienceResult.status === 'fulfilled' ? unwrapCollection(experienceResult.value) : [],
          education: educationResult.status === 'fulfilled' ? unwrapCollection(educationResult.value) : [],
          activities: activitiesResult.status === 'fulfilled' ? unwrapCollection(activitiesResult.value) : [],
          achievements: achievementsResult.status === 'fulfilled' ? unwrapCollection(achievementsResult.value) : [],
          certifications: certificationsResult.status === 'fulfilled' ? unwrapCollection(certificationsResult.value) : [],
          blogs: blogsResult.status === 'fulfilled' ? unwrapCollection(blogsResult.value) : [],
          testimonials: testimonialsResult.status === 'fulfilled' ? unwrapCollection(testimonialsResult.value) : [],
        });
      } catch {
        if (isMounted) {
          toast.error('Failed to load publish readiness.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const derived = useMemo(() => {
    const visibleProjects = content.projects.filter((item) => item?.is_visible !== false);
    const publishedBlogs = content.blogs.filter((item) => item?.is_published);
    const sectionStates = buildSectionStates(profile, content);
    const checks = readinessDefinitions({ profile, content, visibleProjects });
    const requiredChecks = checks.filter((item) => item.required);
    const recommendedChecks = checks.filter((item) => !item.required);
    const passedChecks = checks.filter((item) => item.status).length;
    const readinessScore = checks.length > 0 ? Math.round((passedChecks / checks.length) * 100) : 0;
    const blockers = requiredChecks.filter((item) => !item.status);
    const recommendations = recommendedChecks.filter((item) => !item.status);
    const liveSections = sectionStates.filter((item) => item.active);
    const hiddenSections = sectionStates.filter((item) => !item.active);
    const publicHandle = profile?.username_slug || user?.username || '';
    const publicUrl = publicHandle ? `${window.location.origin}/${publicHandle}` : '';
    const portfolioAccess = PORTFOLIO_ACCESS_COPY[profile?.portfolio_visibility] || PORTFOLIO_ACCESS_COPY.public;
    const portfolioSignals = [
      {
        id: 'resume',
        label: 'Resume',
        status: profile?.resume || profile?.resume_download_url ? 'Live' : 'Missing',
        active: Boolean(profile?.resume || profile?.resume_download_url),
      },
      {
        id: 'contact',
        label: 'Contact',
        status: profile?.show_contact !== false ? 'Live' : 'Hidden',
        active: profile?.show_contact !== false,
      },
      {
        id: 'testimonials',
        label: 'Testimonials',
        status: content.testimonials.length > 0 && profile?.show_testimonials !== false ? 'Live' : content.testimonials.length > 0 ? 'Hidden' : 'Missing',
        active: content.testimonials.length > 0 && profile?.show_testimonials !== false,
      },
      {
        id: 'blog',
        label: 'Blog',
        status: publishedBlogs.length > 0 && profile?.show_blog !== false ? 'Live' : publishedBlogs.length > 0 ? 'Hidden' : 'Missing',
        active: publishedBlogs.length > 0 && profile?.show_blog !== false,
      },
    ];

    return {
      visibleProjects,
      publishedBlogs,
      sectionStates,
      checks,
      readinessScore,
      blockers,
      recommendations,
      liveSections,
      hiddenSections,
      publicUrl,
      portfolioAccess,
      canOpenPublicUrl: Boolean(publicUrl),
      portfolioSignals,
      publishedCount: liveSections.length,
      contentInventory:
        visibleProjects.length +
        content.skills.length +
        content.experience.length +
        content.education.length +
        content.activities.length +
        content.achievements.length +
        content.certifications.length +
        publishedBlogs.length +
        content.testimonials.length,
    };
  }, [content, profile, user?.username]);

  const readinessTone = derived.readinessScore >= 85
    ? 'cyan'
    : derived.readinessScore >= 60
      ? 'accent'
      : 'pink';
  const readinessLabel = derived.blockers.length === 0
    ? derived.recommendations.length === 0
      ? 'Ready to share'
      : 'Shareable, but could be stronger'
    : 'Needs work before sharing';

  const handleCopy = async () => {
    if (!derived.publicUrl) {
      toast.error('Portfolio URL is not available yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(derived.publicUrl);
      toast.success(`${derived.portfolioAccess.label} portfolio link copied.`);
    } catch {
      toast.error('Failed to copy portfolio link.');
    }
  };

  if (loading) {
    return (
      <div className="admin-content-page">
        <LoadingSkeleton variant="title" />
        <LoadingSkeleton variant="text" count={6} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="admin-content-page">
        <div className="admin-panel__empty glass">
          <p>Publish readiness is unavailable right now. Retry from the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content-page admin-publish">
      <div className="admin-page-header admin-content-page__header">
        <div>
          <h1>Publish Preview</h1>
          <p>Review readiness, live sections, and direct fixes before sharing your portfolio.</p>
        </div>
        <div className="admin-actions">
          {derived.publicUrl && (
            <>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleCopy}>
                <FaCopy /> Copy Link
              </button>
              <a href={derived.publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                <FaExternalLinkAlt /> Open Portfolio
              </a>
            </>
          )}
        </div>
      </div>

      <div className="admin-content-insights">
        <div className="admin-content-insights__item">
          <span className="admin-content-insights__label">Readiness</span>
          <strong className="admin-content-insights__value">{derived.readinessScore}%</strong>
        </div>
        <div className="admin-content-insights__item">
          <span className="admin-content-insights__label">Blocking Issues</span>
          <strong className="admin-content-insights__value">{derived.blockers.length}</strong>
        </div>
        <div className="admin-content-insights__item">
          <span className="admin-content-insights__label">Live Sections</span>
          <strong className="admin-content-insights__value">{derived.publishedCount}</strong>
        </div>
        <div className="admin-content-insights__item">
          <span className="admin-content-insights__label">Content Inventory</span>
          <strong className="admin-content-insights__value">{derived.contentInventory}</strong>
        </div>
      </div>

      <div className="admin-publish__hero glass">
        <div className="admin-publish__hero-copy">
          <p className="admin-dashboard__eyebrow">Readiness Snapshot</p>
          <h2>{readinessLabel}</h2>
          <p className="admin-dashboard__subtext">
            {derived.blockers.length === 0
              ? 'The core launch requirements are covered. Review recommendations to make the portfolio feel stronger before sending it out.'
              : 'Fix the blocking items below first so the public portfolio does not look incomplete or hard to trust.'}
          </p>
          <div className="admin-publish__hero-actions">
            {derived.blockers[0] ? (
              <Link to={derived.blockers[0].path} className="btn btn-primary btn-sm">
                {derived.blockers[0].action} <FaArrowRight />
              </Link>
            ) : derived.canOpenPublicUrl ? (
              <a href={derived.publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                <FaPaperPlane /> Review Public Portfolio
              </a>
            ) : (
              <Link to="/user/profile" className="btn btn-primary btn-sm">
                Add Public Handle <FaArrowRight />
              </Link>
            )}
            <Link to="/user/dashboard" className="btn btn-outline btn-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className={`admin-publish__score admin-publish__score--${readinessTone}`}>
          <div className="admin-publish__score-ring">
            <strong>{derived.readinessScore}%</strong>
            <span>{readinessLabel}</span>
          </div>
          <div className="admin-publish__score-track" aria-hidden="true">
            <div style={{ width: `${derived.readinessScore}%` }} />
          </div>
          <small>
            {derived.checks.filter((item) => item.status).length}/{derived.checks.length} checks passed
          </small>
        </div>
      </div>

      <div className="admin-publish__grid">
        <section className="glass admin-publish__panel">
          <div className="admin-publish__panel-header">
            <h2>Required Before Sharing</h2>
            <span className={`chip ${derived.blockers.length === 0 ? 'chip-status-active' : ''}`}>
              {derived.blockers.length === 0 ? 'All clear' : `${derived.blockers.length} blockers`}
            </span>
          </div>
          <div className="admin-publish__checks">
            {derived.checks.filter((item) => item.required).map((item) => (
              <article key={item.id} className={`admin-publish__check ${item.status ? 'admin-publish__check--done' : 'admin-publish__check--pending'}`}>
                <div className="admin-publish__check-status">
                  {item.status ? <FaCheckCircle /> : <FaTimesCircle />}
                </div>
                <div className="admin-publish__check-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <Link to={item.path} className="admin-dashboard__action-link">
                  {item.action} <FaArrowRight />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="glass admin-publish__panel">
          <div className="admin-publish__panel-header">
            <h2>Recommended Improvements</h2>
            <span className="chip">{derived.recommendations.length} open</span>
          </div>
          {derived.recommendations.length > 0 ? (
            <div className="admin-publish__checks">
              {derived.recommendations.map((item) => (
                <article key={item.id} className="admin-publish__check admin-publish__check--soft">
                  <div className="admin-publish__check-status">{item.icon}</div>
                  <div className="admin-publish__check-copy">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <Link to={item.path} className="admin-dashboard__action-link">
                    {item.action} <FaArrowRight />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <FaCheckCircle />
              <p>Recommended improvements are covered. Keep content fresh as your work evolves.</p>
            </div>
          )}
        </section>
      </div>

      <div className="admin-publish__grid">
        <section className="glass admin-publish__panel">
          <div className="admin-publish__panel-header">
            <h2>Portfolio Signals</h2>
            <span className="chip">{derived.portfolioSignals.filter((item) => item.active).length} live</span>
          </div>
          <div className="admin-publish__signals">
            {derived.portfolioSignals.map((item) => (
              <article key={item.id} className="admin-publish__signal">
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.status}</p>
                </div>
                <span className={`chip ${item.active ? 'chip-status-active' : ''}`}>{item.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="glass admin-publish__panel">
          <div className="admin-publish__panel-header">
            <h2>Public Portfolio Preview</h2>
            <span className="chip chip-status-active">{derived.portfolioAccess.label}</span>
          </div>
          <div className="admin-publish__meta">
            <div>
              <span>{derived.portfolioAccess.urlLabel}</span>
              <strong>{derived.publicUrl || 'Unavailable'}</strong>
            </div>
            <div>
              <span>Access mode</span>
              <strong>{derived.portfolioAccess.description}</strong>
            </div>
            <div>
              <span>Visible projects</span>
              <strong>{derived.visibleProjects.length}</strong>
            </div>
            <div>
              <span>Published articles</span>
              <strong>{derived.publishedBlogs.length}</strong>
            </div>
            <div>
              <span>Testimonials</span>
              <strong>{content.testimonials.length}</strong>
            </div>
          </div>
          <div className="admin-publish__actions-row">
            <button type="button" className="btn btn-outline btn-sm" onClick={handleCopy}>
              <FaCopy /> Copy Link
            </button>
            {derived.canOpenPublicUrl ? (
              <a href={derived.publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                <FaExternalLinkAlt /> Open Portfolio View
              </a>
            ) : (
              <Link to="/user/profile" className="btn btn-outline btn-sm">
                <FaUser /> Finish Profile
              </Link>
            )}
          </div>
        </section>

        <section className="glass admin-publish__panel">
          <div className="admin-publish__panel-header">
            <h2>Section Visibility</h2>
            <span className="chip">{derived.liveSections.length} live</span>
          </div>
          <div className="admin-publish__section-groups">
            <div>
              <p className="admin-publish__section-title">Visible Now</p>
              <div className="admin-publish__chips">
                {derived.liveSections.map((item) => (
                  <span key={item.id} className="chip chip-status-active">{item.label}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="admin-publish__section-title">Hidden or Missing</p>
              <div className="admin-publish__chips">
                {derived.hiddenSections.map((item) => (
                  <span key={item.id} className="chip">{item.label}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="admin-publish__actions-row">
            <Link to="/user/profile?view=visibility" className="btn btn-outline btn-sm">
              <FaLayerGroup /> Manage Visibility
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
