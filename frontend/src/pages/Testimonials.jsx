import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import SectionWrapper from '../components/SectionWrapper';
import PageTransition from '../components/PageTransition';
import TestimonialsComponent from '../components/Testimonials';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <PageTransition>
      <Helmet>
        <title>Testimonials | Client Reviews & Feedback</title>
        <meta name="description" content="Read what clients and colleagues say about working with me. Testimonials and reviews from successful projects." />
      </Helmet>

      <Navbar />

      <SectionWrapper className="testimonials-hero">
        <motion.div 
          className="testimonials-hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="testimonials-hero__title">
            Client <span className="gradient-text">Testimonials</span>
          </h1>
          <p className="testimonials-hero__subtitle">
            Hear from the amazing clients and colleagues I've had the privilege to work with
          </p>
        </motion.div>
      </SectionWrapper>

      <TestimonialsComponent />
    </PageTransition>
  );
}