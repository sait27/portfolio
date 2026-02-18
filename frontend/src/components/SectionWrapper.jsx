import { motion } from 'framer-motion';
import useScrollReveal from '../hooks/useScrollReveal';

const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Wraps a section to trigger scroll-reveal animation when it enters the viewport.
 * Accepts optional className and id for styling/navigation.
 */
export default function SectionWrapper({ children, className = '', id, delay = 0 }) {
  const [ref, isInView] = useScrollReveal({ threshold: 0.1 });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`section ${className}`}
      variants={revealVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay }}
    >
      <div className="container">
        {children}
      </div>
    </motion.section>
  );
}
