import './LoadingSkeleton.css';

/**
 * Shimmer loading skeleton for placeholder content.
 * Variants: 'text', 'title', 'card', 'avatar', 'thumbnail'
 */
export default function LoadingSkeleton({ variant = 'text', count = 1, className = '' }) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton skeleton--${variant} ${className}`} />
  ));

  return <>{skeletons}</>;
}

/**
 * Full card skeleton for project cards.
 */
export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton--thumbnail" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton--title" style={{ width: '60%' }} />
        <div className="skeleton skeleton--text" style={{ width: '90%' }} />
        <div className="skeleton skeleton--text" style={{ width: '75%' }} />
        <div className="skeleton-card__chips">
          <div className="skeleton skeleton--chip" />
          <div className="skeleton skeleton--chip" />
          <div className="skeleton skeleton--chip" />
        </div>
      </div>
    </div>
  );
}
