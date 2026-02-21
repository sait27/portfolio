import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
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
} from 'react-icons/fa';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const normalizedStats = {
    projects: stats?.projects || 0,
    featured_projects: stats?.featured_projects || 0,
    skills: stats?.skills || 0,
    categories: stats?.categories || 0,
    experience: stats?.experience || 0,
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
    normalizedStats.blog_posts +
    normalizedStats.testimonials;

  const publishRate = normalizedStats.blog_posts > 0
    ? Math.round((normalizedStats.published_posts / normalizedStats.blog_posts) * 100)
    : 0;

  const spotlightCards = [
    {
      label: 'Content Inventory',
      value: totalContentItems,
      hint: 'Projects, skills, experience, posts and testimonials',
      icon: <FaChartLine />,
      color: 'accent',
    },
    {
      label: 'Inbox Focus',
      value: normalizedStats.unread_messages,
      hint: normalizedStats.unread_messages > 0 ? 'Unread messages need a response' : 'Inbox is up to date',
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
    { label: 'Featured Projects', value: normalizedStats.featured_projects, icon: <FaProjectDiagram />, color: 'cyan' },
    { label: 'Skills', value: normalizedStats.skills, icon: <FaCode />, color: 'accent' },
    { label: 'Skill Categories', value: normalizedStats.categories, icon: <FaCode />, color: 'cyan' },
    { label: 'Experience Entries', value: normalizedStats.experience, icon: <FaBriefcase />, color: 'pink' },
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
      text: `${normalizedStats.unread_messages} unread message${normalizedStats.unread_messages > 1 ? 's' : ''} waiting in inbox.`,
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
  if (attentionItems.length === 0) {
    attentionItems.push({
      text: 'Everything looks healthy. Keep content fresh to improve discoverability.',
      path: '/user/profile',
      action: 'Review profile',
      positive: true,
    });
  }

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
            {[1, 2, 3, 4, 5, 6].map(i => (
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
              <h2 className="admin-dashboard__headline">{totalContentItems} total content items published</h2>
              <p className="admin-dashboard__subtext">
                {normalizedStats.unread_messages > 0
                  ? `${normalizedStats.unread_messages} unread message${normalizedStats.unread_messages > 1 ? 's' : ''} still needs attention.`
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

          <section className="admin-dashboard__section">
            <div className="admin-dashboard__section-header">
              <h2>Portfolio Metrics</h2>
            </div>
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
                  <div className={`admin-stat__value admin-stat__value--${card.color}`}>
                    {card.value}
                  </div>
                </Motion.div>
              ))}
            </div>
          </section>

          <section className="admin-dashboard__section">
            <div className="admin-dashboard__section-header">
              <h2>Quick Actions</h2>
            </div>
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
          </section>

          <section className="admin-dashboard__section">
            <div className="admin-dashboard__section-header">
              <h2>Needs Attention</h2>
            </div>
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
          </section>
        </>
      )}
    </div>
  );
}
