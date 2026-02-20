import { motion } from 'framer-motion';
import './EmptyState.css';

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}) {
  return (
    <motion.div 
      className="empty-state glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {icon && (
        <div className="empty-state__icon">
          {icon}
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </motion.div>
  );
}
