import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, Reorder, useDragControls } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaProjectDiagram,
  FaEnvelope,
  FaCode,
  FaBriefcase,
  FaBlog,
  FaQuoteLeft,
  FaArrowRight,
  FaExclamationCircle,
  FaChartLine,
  FaPaperPlane,
  FaCertificate,
  FaGraduationCap,
  FaTrophy,
  FaUsers,
  FaGripVertical,
} from 'react-icons/fa';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const DASHBOARD_SECTION_IDS = ['portfolio_metrics', 'quick_actions', 'needs_attention'];

const normalizeSectionOrder = (rawOrder) => {
  if (!Array.isArray(rawOrder)) {
    return DASHBOARD_SECTION_IDS;
  }

  const filtered = rawOrder.filter((sectionId) => DASHBOARD_SECTION_IDS.includes(sectionId));
  if (filtered.length !== DASHBOARD_SECTION_IDS.length) {
    return DASHBOARD_SECTION_IDS;
  }

  if (new Set(filtered).size !== DASHBOARD_SECTION_IDS.length) {
    return DASHBOARD_SECTION_IDS;
  }

  return filtered;
};

const isSameOrder = (left, right) =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

function SortableDashboardSection({ section, onDragEnd }) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={section.id}
      className="admin-dashboard__section-shell"
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{ scale: 1.01, zIndex: 2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onDragEnd={onDragEnd}
    >
      <section className="admin-dashboard__section">
        <div className="admin-dashboard__section-header">
          <h2>{section.title}</h2>
          <button
            type="button"
            className="admin-dashboard__drag-handle"
            onPointerDown={(event) => dragControls.start(event)}
            aria-label={`Drag to reorder ${section.title}`}
            title="Drag to reorder"
          >
            <FaGripVertical />
            Drag
          </button>
        </div>
        {section.content}
      </section>
    </Reorder.Item>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionOrder, setSectionOrder] = useState(DASHBOARD_SECTION_IDS);
  const [lastSavedSectionOrder, setLastSavedSectionOrder] = useState(DASHBOARD_SECTION_IDS);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const latestSectionOrderRef = useRef(DASHBOARD_SECTION_IDS);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      const [statsResult, profileResult] = await Promise.allSettled([
        userApi.getStats(),
        userApi.getProfile(),
      ]);

      if (!isMounted) {
        return;
      }

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data);
      }

      if (profileResult.status === 'fulfilled') {
        const normalizedOrder = normalizeSectionOrder(profileResult.value?.data?.dashboard_section_order);
        setSectionOrder(normalizedOrder);
        setLastSavedSectionOrder(normalizedOrder);
        latestSectionOrderRef.current = normalizedOrder;
      }

      setLoading(false);
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSectionOrder = async (nextOrder) => {
    if (isSameOrder(nextOrder, lastSavedSectionOrder)) {
      return;
    }

    setIsSavingOrder(true);
    try {
      await userApi.patchProfile({ dashboard_section_order: nextOrder });
      setLastSavedSectionOrder(nextOrder);
    } catch {
      toast.error('Failed to save dashboard section order.');
      setSectionOrder(lastSavedSectionOrder);
      latestSectionOrderRef.current = lastSavedSectionOrder;
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleSectionReorder = (nextOrder) => {
    const normalizedOrder = normalizeSectionOrder(nextOrder);
    setSectionOrder(normalizedOrder);
    latestSectionOrderRef.current = normalizedOrder;
  };

  const handleSectionDragEnd = () => {
    void persistSectionOrder(latestSectionOrderRef.current);
  };

  const normalizedStats = {
    projects: stats?.projects || 0,
    featured_projects: stats?.featured_projects || 0,
    skills: stats?.skills || 0,
    categories: stats?.categories || 0,
    experience: stats?.experience || 0,
    education: stats?.education || 0,
    activities: stats?.activities || 0,
    achievements: stats?.achievements || 0,
    certifications: stats?.certifications || 0,
    blog_posts: stats?.blog_posts || 0,
    published_posts: stats?.published_posts || 0,
    testimonials: stats?.testimonials || 0,
    messages: stats?.messages || 0,
    unread_messages: stats?.unread_messages || 0,
  };

  const totalContentItems =
    normalizedStats.projects +
    normalizedStats.skills +
    normalizedStats.experience +
    normalizedStats.education +
    normalizedStats.activities +
    normalizedStats.achievements +
    normalizedStats.certifications +
    normalizedStats.blog_posts +
    normalizedStats.testimonials;

  const publishRate =
    normalizedStats.blog_posts > 0
      ? Math.round((normalizedStats.published_posts / normalizedStats.blog_posts) * 100)
      : 0;

  const spotlightCards = [
    {
      label: 'Content Inventory',
      value: totalContentItems,
      hint: 'Projects, skills, experience, milestones, posts and testimonials',
      icon: <FaChartLine />,
      color: 'accent',
    },
    {
      label: 'Inbox Focus',
      value: normalizedStats.unread_messages,
      hint:
        normalizedStats.unread_messages > 0
          ? 'Unread messages need a response'
          : 'Inbox is up to date',
      icon: <FaEnvelope />,
      color: normalizedStats.unread_messages > 0 ? 'pink' : 'cyan',
    },
    {
      label: 'Publishing Ratio',
      value: `${publishRate}%`,
      hint: `${normalizedStats.published_posts} published out of ${normalizedStats.blog_posts} posts`,
      icon: <FaPaperPlane />,
      color: publishRate >= 60 ? 'cyan' : 'accent',
    },
  ];

  const statCards = [
    { label: 'Total Projects', value: normalizedStats.projects, icon: <FaProjectDiagram />, color: 'accent' },
    {
      label: 'Featured Projects',
      value: normalizedStats.featured_projects,
      icon: <FaProjectDiagram />,
      color: 'cyan',
    },
    { label: 'Skills', value: normalizedStats.skills, icon: <FaCode />, color: 'accent' },
    { label: 'Skill Categories', value: normalizedStats.categories, icon: <FaCode />, color: 'cyan' },
    {
      label: 'Experience Entries',
      value: normalizedStats.experience,
      icon: <FaBriefcase />,
      color: 'pink',
    },
    {
      label: 'Education Entries',
      value: normalizedStats.education,
      icon: <FaGraduationCap />,
      color: 'cyan',
    },
    { label: 'Activities', value: normalizedStats.activities, icon: <FaUsers />, color: 'accent' },
    { label: 'Achievements', value: normalizedStats.achievements, icon: <FaTrophy />, color: 'pink' },
    {
      label: 'Certifications',
      value: normalizedStats.certifications,
      icon: <FaCertificate />,
      color: 'cyan',
    },
    { label: 'Blog Posts', value: normalizedStats.blog_posts, icon: <FaBlog />, color: 'accent' },
    { label: 'Published Posts', value: normalizedStats.published_posts, icon: <FaBlog />, color: 'cyan' },
    { label: 'Testimonials', value: normalizedStats.testimonials, icon: <FaQuoteLeft />, color: 'pink' },
    { label: 'Total Messages', value: normalizedStats.messages, icon: <FaEnvelope />, color: 'accent' },
    { label: 'Unread Messages', value: normalizedStats.unread_messages, icon: <FaEnvelope />, color: 'pink' },
  ];

  const quickActions = [
    {
      title: 'Manage Projects',
      text: 'Update featured work, links, and tech stack details.',
      path: '/user/projects',
      icon: <FaProjectDiagram />,
      tone: 'accent',
    },
    {
      title: 'Manage Blog',
      text: 'Draft, publish, and refresh your latest articles.',
      path: '/user/blog',
      icon: <FaBlog />,
      tone: 'cyan',
    },
    {
      title: 'Manage Testimonials',
      text: 'Curate feedback and social proof from clients.',
      path: '/user/testimonials',
      icon: <FaQuoteLeft />,
      tone: 'pink',
    },
    {
      title: 'Edit Education',
      text: 'Manage institutions, degrees, grades, and academic timeline.',
      path: '/user/milestones?section=education',
      icon: <FaGraduationCap />,
      tone: 'cyan',
    },
    {
      title: 'Edit Activities',
      text: 'Update extracurricular leadership, clubs, and community work.',
      path: '/user/milestones?section=activities',
      icon: <FaUsers />,
      tone: 'accent',
    },
    {
      title: 'Edit Achievements',
      text: 'Maintain awards, accomplishments, and proof links.',
      path: '/user/milestones?section=achievements',
      icon: <FaTrophy />,
      tone: 'pink',
    },
    {
      title: 'Edit Certifications',
      text: 'Keep credentials, IDs, validity dates, and verification links current.',
      path: '/user/milestones?section=certifications',
      icon: <FaCertificate />,
      tone: 'cyan',
    },
    {
      title: 'Review Messages',
      text: 'Handle incoming inquiries and follow-ups quickly.',
      path: '/user/messages',
      icon: <FaEnvelope />,
      tone: 'accent',
    },
    {
      title: 'Edit Profile',
      text: 'Keep your public bio, CTA, and social links current.',
      path: '/user/profile',
      icon: <FaBriefcase />,
      tone: 'cyan',
    },
  ];

  const attentionItems = [];
  if (normalizedStats.unread_messages > 0) {
    attentionItems.push({
      text: `${normalizedStats.unread_messages} unread message${
        normalizedStats.unread_messages > 1 ? 's' : ''
      } waiting in inbox.`,
      path: '/user/messages',
      action: 'Open messages',
    });
  }
  if (normalizedStats.blog_posts > 0 && normalizedStats.published_posts === 0) {
    attentionItems.push({
      text: 'You have blog drafts but no published article yet.',
      path: '/user/blog',
      action: 'Publish a post',
    });
  }
  if (normalizedStats.projects === 0) {
    attentionItems.push({
      text: 'No projects added yet. Portfolio visitors will see an empty section.',
      path: '/user/projects',
      action: 'Add project',
    });
  }
  if (
    normalizedStats.education === 0 &&
    normalizedStats.activities === 0 &&
    normalizedStats.achievements === 0 &&
    normalizedStats.certifications === 0
  ) {
    attentionItems.push({
      text: 'Milestone sections are empty. Add education, achievements, and certifications for stronger trust signals.',
      path: '/user/milestones?section=education',
      action: 'Add milestones',
    });
  }
  if (attentionItems.length === 0) {
    attentionItems.push({
      text: 'Everything looks healthy. Keep content fresh to improve discoverability.',
      path: '/user/profile',
      action: 'Review profile',
      positive: true,
    });
  }

  const dashboardSections = {
    portfolio_metrics: {
      id: 'portfolio_metrics',
      title: 'Portfolio Metrics',
      content: (
        <div className="admin-stats">
          {statCards.map((card, i) => (
            <Motion.div
              key={card.label}
              className="admin-stat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="admin-stat__label">
                <span className={`admin-stat__icon admin-stat__icon--${card.color}`}>{card.icon}</span>
                {card.label}
              </div>
              <div className={`admin-stat__value admin-stat__value--${card.color}`}>{card.value}</div>
            </Motion.div>
          ))}
        </div>
      ),
    },
    quick_actions: {
      id: 'quick_actions',
      title: 'Quick Actions',
      content: (
        <div className="admin-dashboard__actions">
          {quickActions.map((action, i) => (
            <Motion.div
              key={action.path}
              className={`admin-dashboard__action-card admin-dashboard__action-card--${action.tone}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
            >
              <div className="admin-dashboard__action-icon">{action.icon}</div>
              <div className="admin-dashboard__action-content">
                <h3>{action.title}</h3>
                <p>{action.text}</p>
              </div>
              <Link to={action.path} className="admin-dashboard__action-link">
                Open <FaArrowRight />
              </Link>
            </Motion.div>
          ))}
        </div>
      ),
    },
    needs_attention: {
      id: 'needs_attention',
      title: 'Needs Attention',
      content: (
        <div className="admin-dashboard__alerts">
          {attentionItems.map((item, i) => (
            <Motion.div
              key={`${item.text}-${i}`}
              className={`admin-dashboard__alert ${item.positive ? 'admin-dashboard__alert--positive' : ''}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
            >
              <div className="admin-dashboard__alert-copy">
                <FaExclamationCircle />
                <p>{item.text}</p>
              </div>
              <Link to={item.path} className="btn btn-outline btn-sm">
                {item.action}
              </Link>
            </Motion.div>
          ))}
        </div>
      ),
    },
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header admin-dashboard__header">
        <h1>Dashboard</h1>
        <p>Track portfolio health, publishing activity, and incoming leads.</p>
      </div>

      {loading ? (
        <div className="admin-dashboard__loading">
          <div className="admin-dashboard__summary">
            <LoadingSkeleton variant="title" />
            <LoadingSkeleton variant="text" />
          </div>
          <div className="admin-stats">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="admin-stat">
                <LoadingSkeleton variant="text" />
                <LoadingSkeleton variant="title" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="admin-dashboard__summary glass">
            <div>
              <p className="admin-dashboard__eyebrow">Performance Snapshot</p>
              <h2 className="admin-dashboard__headline">
                {totalContentItems} total content items published
              </h2>
              <p className="admin-dashboard__subtext">
                {normalizedStats.unread_messages > 0
                  ? `${normalizedStats.unread_messages} unread message${
                      normalizedStats.unread_messages > 1 ? 's' : ''
                    } still needs attention.`
                  : 'No unread messages right now. Response queue is clear.'}
              </p>
            </div>
            <div className="admin-dashboard__summary-grid">
              {spotlightCards.map((card, i) => (
                <Motion.div
                  key={card.label}
                  className={`admin-dashboard__spotlight admin-dashboard__spotlight--${card.color}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="admin-dashboard__spotlight-icon">{card.icon}</div>
                  <div className="admin-dashboard__spotlight-body">
                    <p>{card.label}</p>
                    <strong>{card.value}</strong>
                    <small>{card.hint}</small>
                  </div>
                </Motion.div>
              ))}
            </div>
          </div>

          <p className="admin-dashboard__reorder-hint">
            Drag a section handle to reorder dashboard blocks.
            <span>{isSavingOrder ? ' Saving order...' : ' Order syncs to your account.'}</span>
          </p>

          <Reorder.Group
            axis="y"
            values={sectionOrder}
            onReorder={handleSectionReorder}
            className="admin-dashboard__sections"
          >
            {sectionOrder.map((sectionId) => {
              const section = dashboardSections[sectionId];
              if (!section) {
                return null;
              }

              return (
                <SortableDashboardSection
                  key={section.id}
                  section={section}
                  onDragEnd={handleSectionDragEnd}
                />
              );
            })}
          </Reorder.Group>
        </>
      )}
    </div>
  );
}
