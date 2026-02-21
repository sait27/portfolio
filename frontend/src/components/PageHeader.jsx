import './PageHeader.css';

export default function PageHeader({
  title,
  highlight,
  subtitle,
  align = 'center',
  badge,
  className = '',
}) {
  const alignmentClass = align === 'left' ? 'page-header--left' : 'page-header--center';

  return (
    <header className={`page-header ${alignmentClass} ${className}`.trim()}>
      {badge && <span className="page-header__badge">{badge}</span>}
      <h1 className="page-header__title">
        {title} {highlight && <span className="gradient-text">{highlight}</span>}
      </h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
    </header>
  );
}
