import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, Reorder, useDragControls } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaCheckCircle,
  FaProjectDiagram,
  FaEnvelope,
  FaBolt,
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
  FaSyncAlt,
} from 'react-icons/fa';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const DASHBOARD_SECTION_IDS = ['launch_checklist', 'portfolio_metrics', 'quick_actions', 'needs_attention'];

const normalizeSectionOrder = (rawOrder) => {
  if (!Array.isArray(rawOrder)) {
    return DASHBOARD_SECTION_IDS;
  }

  const filtered = rawOrder.filter((sectionId) => DASHBOARD_SECTION_IDS.includes(sectionId));
  if (new Set(filtered).size !== filtered.length) {
    return DASHBOARD_SECTION_IDS;
  }

  return [
    ...filtered,
    ...DASHBOARD_SECTION_IDS.filter((sectionId) => !filtered.includes(sectionId)),
  ];
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
  const [dashboardProfile, setDashboardProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsUnavailable, setStatsUnavailable] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [sectionOrder, setSectionOrder] = useState(DASHBOARD_SECTION_IDS);
  const [lastSavedSectionOrder, setLastSavedSectionOrder] = useState(DASHBOARD_SECTION_IDS);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const [showAllQuickActions, setShowAllQuickActions] = useState(false);
  const latestSectionOrderRef = useRef(DASHBOARD_SECTION_IDS);
  const hasStatsRef = useRef(false);

  const applyDashboardResults = useCallback((statsResult, profileResult) => {
    const errors = [];

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value.data);
      setStatsUnavailable(false);
      hasStatsRef.current = true;
    } else {
      setStatsUnavailable(true);
      errors.push(
        hasStatsRef.current
          ? 'Metrics refresh failed. Showing last synced values.'
          : 'Unable to load dashboard metrics.'
      );
    }

    if (profileResult.status === 'fulfilled') {
      const profileData = profileResult.value?.data || null;
      const normalizedOrder = normalizeSectionOrder(profileData?.dashboard_section_order);
      setDashboardProfile(profileData);
      setSectionOrder(normalizedOrder);
      setLastSavedSectionOrder(normalizedOrder);
      latestSectionOrderRef.current = normalizedOrder;
    } else {
      setDashboardProfile(null);
      errors.push('Dashboard section order could not be synced.');
    }

    setDashboardError(errors.join(' '));
  }, []);

  const fetchDashboard = async ({ initial = false } = {}) => {
    if (initial) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setDashboardError('');
    const [statsResult, profileResult] = await Promise.allSettled([
      userApi.getStats(),
      userApi.getProfile(),
    ]);
    applyDashboardResults(statsResult, profileResult);

    if (initial) {
      setLoading(false);
    } else {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      setLoading(true);
      setDashboardError('');
      const [statsResult, profileResult] = await Promise.allSettled([
        userApi.getStats(),
        userApi.getProfile(),
      ]);
      if (!isMounted) {
        return;
      }
      applyDashboardResults(statsResult, profileResult);
      setLoading(false);
    };

    void loadInitial();
    return () => {
      isMounted = false;
    };
  }, [applyDashboardResults]);

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

  const handleRetryDashboardLoad = () => {
    void fetchDashboard();
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
  const hasStatsData = Boolean(stats);
  const hasResume = Boolean(dashboardProfile?.resume || dashboardProfile?.resume_download_url);
  const hasProfileBasics = Boolean(
    dashboardProfile?.full_name?.trim()
    && dashboardProfile?.email?.trim()
    && dashboardProfile?.tagline?.trim()
  );
  const hasProfileStory = Boolean(dashboardProfile?.bio?.trim());
  const hasAvatar = Boolean(dashboardProfile?.avatar);
  const hasSocialLinks = Boolean(
    dashboardProfile?.website_url
    || dashboardProfile?.github_url
    || dashboardProfile?.linkedin_url
    || dashboardProfile?.twitter_url
  );

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
  const hasEmptyMilestones =
    normalizedStats.education === 0 &&
    normalizedStats.activities === 0 &&
    normalizedStats.achievements === 0 &&
    normalizedStats.certifications === 0;
  const hasDraftOnlyBlog = normalizedStats.blog_posts > 0 && normalizedStats.published_posts === 0;
  const onboardingSteps = [
    {
      id: 'profile-basics',
      title: 'Complete profile basics',
      description: 'Add your name, tagline, and contact details so the public portfolio feels credible immediately.',
      path: '/user/profile',
      action: hasProfileBasics ? 'Review profile' : 'Complete basics',
      done: hasProfileBasics,
      icon: <FaBriefcase />,
    },
    {
      id: 'profile-story',
      title: 'Add your story and identity',
      description: 'A short bio, avatar, and at least one social link make the portfolio look intentional instead of empty.',
      path: '/user/profile',
      action: hasProfileStory && hasAvatar && hasSocialLinks ? 'Polish profile' : 'Add story',
      done: hasProfileStory && hasAvatar && hasSocialLinks,
      icon: <FaChartLine />,
    },
    {
      id: 'skills',
      title: 'Add your core skills',
      description: 'Skills help recruiters and clients understand your stack before they read projects in detail.',
      path: '/user/skills',
      action: normalizedStats.skills >= 5 ? 'Review skills' : 'Add skills',
      done: normalizedStats.skills >= 5,
      icon: <FaCode />,
    },
    {
      id: 'projects',
      title: 'Show proof of work',
      description: 'At least one visible project is the minimum bar for a convincing portfolio.',
      path: '/user/projects',
      action: normalizedStats.projects > 0 ? 'Review projects' : 'Create project',
      done: normalizedStats.projects > 0,
      icon: <FaProjectDiagram />,
    },
    {
      id: 'resume',
      title: 'Upload your resume',
      description: 'Resume upload speeds up setup and gives visitors another asset to review.',
      path: '/user/profile?view=resume',
      action: hasResume ? 'Open resume extract' : 'Upload resume',
      done: hasResume,
      icon: <FaBolt />,
    },
    {
      id: 'trust-signals',
      title: 'Add trust signals',
      description: 'Milestones, articles, or testimonials make the portfolio feel complete and more believable.',
      path: hasEmptyMilestones ? '/user/milestones?section=education' : normalizedStats.testimonials === 0 ? '/user/testimonials' : '/user/blog',
      action: normalizedStats.education + normalizedStats.activities + normalizedStats.achievements + normalizedStats.certifications + normalizedStats.testimonials + normalizedStats.published_posts > 0
        ? 'Improve proof'
        : 'Add proof',
      done: normalizedStats.education + normalizedStats.activities + normalizedStats.achievements + normalizedStats.certifications + normalizedStats.testimonials + normalizedStats.published_posts > 0,
      icon: <FaCertificate />,
    },
  ];
  const completedOnboardingSteps = onboardingSteps.filter((step) => step.done).length;
  const onboardingProgress = onboardingSteps.length > 0
    ? Math.round((completedOnboardingSteps / onboardingSteps.length) * 100)
    : 0;
  const nextOnboardingStep = onboardingSteps.find((step) => !step.done) || onboardingSteps[onboardingSteps.length - 1];

  const spotlightCards = [
    {
      label: 'Publish Readiness',
      value: `${onboardingProgress}%`,
      hint: `${completedOnboardingSteps}/${onboardingSteps.length} onboarding steps complete`,
      icon: <FaCheckCircle />,
      color: onboardingProgress >= 80 ? 'cyan' : onboardingProgress >= 50 ? 'accent' : 'pink',
    },
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

  const coreStatCards = [
    { label: 'Total Projects', value: normalizedStats.projects, icon: <FaProjectDiagram />, color: 'accent' },
    { label: 'Skills', value: normalizedStats.skills, icon: <FaCode />, color: 'accent' },
    { label: 'Experience Entries', value: normalizedStats.experience, icon: <FaBriefcase />, color: 'pink' },
    { label: 'Blog Posts', value: normalizedStats.blog_posts, icon: <FaBlog />, color: 'accent' },
    { label: 'Total Messages', value: normalizedStats.messages, icon: <FaEnvelope />, color: 'accent' },
    { label: 'Unread Messages', value: normalizedStats.unread_messages, icon: <FaEnvelope />, color: 'pink' },
  ];

  const detailedStatCards = [
    { label: 'Featured Projects', value: normalizedStats.featured_projects, icon: <FaProjectDiagram />, color: 'cyan' },
    { label: 'Skill Categories', value: normalizedStats.categories, icon: <FaCode />, color: 'cyan' },
    { label: 'Education Entries', value: normalizedStats.education, icon: <FaGraduationCap />, color: 'cyan' },
    { label: 'Activities', value: normalizedStats.activities, icon: <FaUsers />, color: 'accent' },
    { label: 'Achievements', value: normalizedStats.achievements, icon: <FaTrophy />, color: 'pink' },
    { label: 'Certifications', value: normalizedStats.certifications, icon: <FaCertificate />, color: 'cyan' },
    { label: 'Published Posts', value: normalizedStats.published_posts, icon: <FaBlog />, color: 'cyan' },
    { label: 'Testimonials', value: normalizedStats.testimonials, icon: <FaQuoteLeft />, color: 'pink' },
  ];

  const visibleStatCards = showDetailedMetrics
    ? [...coreStatCards, ...detailedStatCards]
    : coreStatCards;

  const quickActions = [
    {
      id: 'resume-extract',
      title: hasResume ? 'Resume Extract' : 'Upload Resume',
      text: hasResume
        ? 'Extract resume data into profile, projects, experience, and milestones.'
        : 'Upload your resume first, then extract it into portfolio sections.',
      path: '/user/profile?view=resume',
      icon: <FaBolt />,
      tone: 'cyan',
      priority: hasResume ? 210 : 240,
    },
    {
      id: 'messages',
      title: 'Review Messages',
      text: 'Handle incoming inquiries and follow-ups quickly.',
      path: '/user/messages',
      icon: <FaEnvelope />,
      tone: 'accent',
      priority: normalizedStats.unread_messages > 0 ? 200 + normalizedStats.unread_messages : 70,
    },
    {
      id: 'projects',
      title: 'Manage Projects',
      text: 'Update featured work, links, and tech stack details.',
      path: '/user/projects',
      icon: <FaProjectDiagram />,
      tone: 'accent',
      priority: normalizedStats.projects === 0 ? 190 : 95,
    },
    {
      id: 'blog',
      title: 'Manage Blog',
      text: 'Draft, publish, and refresh your latest articles.',
      path: '/user/blog',
      icon: <FaBlog />,
      tone: 'cyan',
      priority: hasDraftOnlyBlog ? 185 : 88,
    },
    {
      id: 'skills',
      title: 'Manage Skills',
      text: 'Curate categories and keep your tech stack current.',
      path: '/user/skills',
      icon: <FaCode />,
      tone: 'pink',
      priority: normalizedStats.skills === 0 ? 165 : 80,
    },
    {
      id: 'experience',
      title: 'Edit Experience',
      text: 'Update role timeline and professional impact highlights.',
      path: '/user/experience',
      icon: <FaBriefcase />,
      tone: 'accent',
      priority: normalizedStats.experience === 0 ? 160 : 78,
    },
    {
      id: 'milestones-education',
      title: 'Edit Education',
      text: 'Manage institutions, degrees, grades, and academic timeline.',
      path: '/user/milestones?section=education',
      icon: <FaGraduationCap />,
      tone: 'cyan',
      priority: hasEmptyMilestones ? 155 : 76,
    },
    {
      id: 'milestones-activities',
      title: 'Edit Activities',
      text: 'Update extracurricular leadership, clubs, and community work.',
      path: '/user/milestones?section=activities',
      icon: <FaUsers />,
      tone: 'accent',
      priority: hasEmptyMilestones ? 152 : 74,
    },
    {
      id: 'milestones-achievements',
      title: 'Edit Achievements',
      text: 'Maintain awards, accomplishments, and proof links.',
      path: '/user/milestones?section=achievements',
      icon: <FaTrophy />,
      tone: 'pink',
      priority: hasEmptyMilestones ? 149 : 72,
    },
    {
      id: 'milestones-certifications',
      title: 'Edit Certifications',
      text: 'Keep credentials, IDs, validity dates, and verification links current.',
      path: '/user/milestones?section=certifications',
      icon: <FaCertificate />,
      tone: 'cyan',
      priority: hasEmptyMilestones ? 147 : 71,
    },
    {
      id: 'testimonials',
      title: 'Manage Testimonials',
      text: 'Curate feedback and social proof from clients.',
      path: '/user/testimonials',
      icon: <FaQuoteLeft />,
      tone: 'pink',
      priority: normalizedStats.testimonials === 0 ? 130 : 68,
    },
    {
      id: 'profile',
      title: 'Edit Profile',
      text: 'Keep your public bio, CTA, and social links current.',
      path: '/user/profile',
      icon: <FaBriefcase />,
      tone: 'cyan',
      priority: totalContentItems === 0 ? 145 : 65,
    },
  ]
    .sort((left, right) => right.priority - left.priority)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const topQuickActions = quickActions.slice(0, 3);
  const visibleQuickActions = showAllQuickActions ? quickActions : topQuickActions;
  const hiddenQuickActionsCount = Math.max(quickActions.length - visibleQuickActions.length, 0);

  const emptyStatePrompts = [];
  if (normalizedStats.projects === 0) {
    emptyStatePrompts.push({
      id: 'empty-projects',
      title: 'No projects yet',
      text: 'Add your first project so visitors can see proof of work.',
      path: '/user/projects',
      action: 'Create project',
      tone: 'accent',
      icon: <FaProjectDiagram />,
    });
  }
  if (!hasResume) {
    emptyStatePrompts.push({
      id: 'empty-resume',
      title: 'Resume not uploaded',
      text: 'Upload your resume and use extraction to seed profile, experience, projects, and milestones faster.',
      path: '/user/profile?view=resume',
      action: 'Open resume extract',
      tone: 'cyan',
      icon: <FaBolt />,
    });
  }
  if (normalizedStats.blog_posts === 0) {
    emptyStatePrompts.push({
      id: 'empty-blog',
      title: 'No articles published',
      text: 'Publish one post to improve trust and search visibility.',
      path: '/user/blog',
      action: 'Create article',
      tone: 'cyan',
      icon: <FaBlog />,
    });
  }
  if (normalizedStats.testimonials === 0) {
    emptyStatePrompts.push({
      id: 'empty-testimonials',
      title: 'No testimonials yet',
      text: 'Add client feedback to strengthen social proof.',
      path: '/user/testimonials',
      action: 'Add testimonial',
      tone: 'pink',
      icon: <FaQuoteLeft />,
    });
  }

  const attentionItems = [];
  if (!hasResume) {
    attentionItems.push({
      severity: 'warning',
      text: 'Resume extraction is not set up yet. Upload a resume to speed up dashboard setup.',
      path: '/user/profile?view=resume',
      action: 'Open resume extract',
    });
  }
  if (normalizedStats.unread_messages >= 3) {
    attentionItems.push({
      severity: 'critical',
      text: `${normalizedStats.unread_messages} unread messages are pending. Prioritize replies now.`,
      path: '/user/messages',
      action: 'Open inbox',
    });
  } else if (normalizedStats.unread_messages > 0) {
    attentionItems.push({
      severity: 'warning',
      text: `${normalizedStats.unread_messages} unread message${
        normalizedStats.unread_messages > 1 ? 's' : ''
      } waiting in inbox.`,
      path: '/user/messages',
      action: 'Open messages',
    });
  }
  if (hasDraftOnlyBlog) {
    attentionItems.push({
      severity: 'warning',
      text: 'You have blog drafts but no published article yet.',
      path: '/user/blog',
      action: 'Publish a post',
    });
  }
  if (normalizedStats.projects === 0) {
    attentionItems.push({
      severity: 'warning',
      text: 'No projects added yet. Portfolio visitors will see an empty section.',
      path: '/user/projects',
      action: 'Add project',
    });
  }
  if (hasEmptyMilestones) {
    attentionItems.push({
      severity: 'info',
      text: 'Milestone sections are empty. Add education, achievements, and certifications for stronger trust signals.',
      path: '/user/milestones?section=education',
      action: 'Add milestones',
    });
  }
  if (attentionItems.length === 0) {
    attentionItems.push({
      severity: 'info',
      text: 'Everything looks healthy. Keep content fresh to improve discoverability.',
      path: '/user/profile',
      action: 'Review profile',
      positive: true,
    });
  }
  const severityRank = { critical: 0, warning: 1, info: 2 };
  attentionItems.sort((left, right) => severityRank[left.severity] - severityRank[right.severity]);

  const dashboardSections = {
    launch_checklist: {
      id: 'launch_checklist',
      title: 'Launch Checklist',
      content: (
        <>
          <div className="admin-dashboard__onboarding glass">
            <div className="admin-dashboard__onboarding-copy">
              <p className="admin-dashboard__eyebrow">Guided Setup</p>
              <h3>
                {onboardingProgress >= 100
                  ? 'Portfolio setup is in a strong state.'
                  : `You are ${onboardingProgress}% of the way to a publish-ready portfolio.`}
              </h3>
              <p className="admin-dashboard__section-note">
                {onboardingProgress >= 100
                  ? 'The core launch checklist is complete. Keep refreshing projects, testimonials, and articles to stay credible.'
                  : `Next best step: ${nextOnboardingStep?.title || 'Review your portfolio setup'}.`}
              </p>
            </div>
            <div className="admin-dashboard__onboarding-meter">
              <div className="admin-dashboard__meter-label">
                <strong>{onboardingProgress}%</strong>
                <span>{completedOnboardingSteps}/{onboardingSteps.length} complete</span>
              </div>
              <div className="admin-dashboard__meter-track" aria-hidden="true">
                <div style={{ width: `${onboardingProgress}%` }} />
              </div>
              {nextOnboardingStep && (
                <Link to={nextOnboardingStep.path} className="btn btn-primary btn-sm">
                  {nextOnboardingStep.action} <FaArrowRight />
                </Link>
              )}
            </div>
          </div>

          <div className="admin-dashboard__checklist">
            {onboardingSteps.map((step, index) => (
              <Motion.article
                key={step.id}
                className={`admin-dashboard__checklist-card ${step.done ? 'admin-dashboard__checklist-card--done' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="admin-dashboard__checklist-status">
                  {step.done ? <FaCheckCircle /> : step.icon}
                </div>
                <div className="admin-dashboard__checklist-copy">
                  <div className="admin-dashboard__checklist-topline">
                    <h3>{step.title}</h3>
                    <span className={`chip ${step.done ? 'chip-status-active' : ''}`}>
                      {step.done ? 'Done' : 'Pending'}
                    </span>
                  </div>
                  <p>{step.description}</p>
                </div>
                <Link to={step.path} className="admin-dashboard__action-link">
                  {step.action} <FaArrowRight />
                </Link>
              </Motion.article>
            ))}
          </div>
        </>
      ),
    },
    portfolio_metrics: {
      id: 'portfolio_metrics',
      title: 'Portfolio Metrics',
      content: (
        <>
          <div className="admin-dashboard__section-tools">
            <p className="admin-dashboard__section-note">
              {showDetailedMetrics
                ? 'Showing core and detailed metrics.'
                : 'Showing core metrics. Expand for full breakdown.'}
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowDetailedMetrics((prev) => !prev)}
            >
              {showDetailedMetrics ? 'Show Core Only' : 'Show Detailed Metrics'}
            </button>
          </div>
          <div className="admin-stats">
            {visibleStatCards.map((card, i) => (
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
        </>
      ),
    },
    quick_actions: {
      id: 'quick_actions',
      title: 'Quick Actions',
      content: (
        <>
          <div className="admin-dashboard__section-tools">
            <p className="admin-dashboard__section-note">
              {showAllQuickActions
                ? 'Showing all available actions.'
                : 'Showing top 3 recommended actions.'}
            </p>
          </div>
          {emptyStatePrompts.length > 0 && (
            <div className="admin-dashboard__empty-prompts">
              {emptyStatePrompts.map((item) => (
                <article key={item.id} className={`admin-dashboard__empty-card admin-dashboard__empty-card--${item.tone}`}>
                  <div className="admin-dashboard__empty-icon">{item.icon}</div>
                  <div className="admin-dashboard__empty-copy">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <Link to={item.path} className="btn btn-outline btn-sm">
                    {item.action}
                  </Link>
                </article>
              ))}
            </div>
          )}
          <div className="admin-dashboard__actions">
            {visibleQuickActions.map((action, i) => (
              <Motion.div
                key={action.id}
                className={`admin-dashboard__action-card admin-dashboard__action-card--${action.tone} ${action.rank <= 3 ? 'admin-dashboard__action-card--priority' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
              >
                {action.rank <= 3 && (
                  <span className="admin-dashboard__action-priority">Priority {action.rank}</span>
                )}
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
          {hiddenQuickActionsCount > 0 && (
            <div className="admin-dashboard__section-tools">
              <p className="admin-dashboard__section-note">
                {hiddenQuickActionsCount} additional actions available.
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowAllQuickActions((prev) => !prev)}
              >
                {showAllQuickActions ? 'Show Top Actions' : `Show All (${quickActions.length})`}
              </button>
            </div>
          )}
        </>
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
              className={`admin-dashboard__alert admin-dashboard__alert--${item.severity} ${item.positive ? 'admin-dashboard__alert--positive' : ''}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
            >
              <div className="admin-dashboard__alert-copy">
                <FaExclamationCircle />
                <div>
                  <span className={`admin-dashboard__severity admin-dashboard__severity--${item.severity}`}>
                    {item.severity}
                  </span>
                  <p>{item.text}</p>
                </div>
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
        <div>
          <h1>Dashboard</h1>
          <p>Track portfolio health, publishing activity, and incoming leads.</p>
        </div>
        <div className="admin-dashboard__header-actions">
          <Link to="/user/profile?view=resume" className="btn btn-primary btn-sm">
            <FaBolt /> Resume Extract
          </Link>
          <Link to="/user/projects" className="btn btn-outline btn-sm">
            <FaProjectDiagram /> New Project
          </Link>
          <Link to="/user/blog" className="btn btn-outline btn-sm">
            <FaBlog /> New Blog
          </Link>
          <Link to="/user/testimonials" className="btn btn-outline btn-sm">
            <FaQuoteLeft /> New Testimonial
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleRetryDashboardLoad}
            disabled={isRefreshing || loading}
          >
            <FaSyncAlt /> {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
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
          {(dashboardError || statsUnavailable) && (
            <div className="admin-dashboard__error glass">
              <div className="admin-dashboard__alert-copy">
                <FaExclamationCircle />
                <p>{dashboardError || 'Some dashboard data could not be loaded.'}</p>
              </div>
              <div className="admin-dashboard__error-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleRetryDashboardLoad}
                  disabled={isRefreshing}
                >
                  <FaSyncAlt /> {isRefreshing ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            </div>
          )}

          {!hasStatsData ? (
            <div className="admin-panel__empty glass">
              <p>Dashboard metrics are unavailable at the moment. Retry to continue.</p>
            </div>
          ) : (
            <>
              <div className="admin-dashboard__summary glass">
                <div>
                  <p className="admin-dashboard__eyebrow">Performance Snapshot</p>
                  <h2 className="admin-dashboard__headline">
                    {totalContentItems > 0
                      ? `${totalContentItems} total content items published`
                      : 'Your dashboard is ready for content'}
                  </h2>
                  <p className="admin-dashboard__subtext">
                    {normalizedStats.unread_messages > 0
                      ? `${normalizedStats.unread_messages} unread message${
                          normalizedStats.unread_messages > 1 ? 's' : ''
                        } still needs attention.`
                      : totalContentItems > 0
                        ? 'No unread messages right now. Response queue is clear.'
                        : 'Start with projects and profile to launch a complete portfolio.'}
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
        </>
      )}
    </div>
  );
}
