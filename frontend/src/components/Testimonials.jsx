import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import SectionWrapper from './SectionWrapper';
import { publicApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Testimonials.css';

export default function Testimonials() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const username = user?.profile?.username_slug || 'demo';
        const response = await publicApi.getTestimonials(username);
        const testimonialsData = response.data?.results || response.data || [];
        setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestimonials();
  }, [user]);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (loading || testimonials.length === 0) {
    return (
      <SectionWrapper className="testimonials">
        <div className="testimonials__header">
          <h2 className="section-title">
            What People <span className="gradient-text">Say</span>
          </h2>
          <p className="section-subtitle">
            Feedback from clients and colleagues I've had the pleasure to work with
          </p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading testimonials...</p>
          </div>
        ) : (
          <div className="testimonials__empty glass" style={{ padding: '3rem', textAlign: 'center' }}>
            <p>No testimonials yet.</p>
          </div>
        )}
      </SectionWrapper>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <SectionWrapper className="testimonials">
      <div className="testimonials__header">
        <h2 className="section-title">
          What People <span className="gradient-text">Say</span>
        </h2>
        <p className="section-subtitle">
          Feedback from clients and colleagues I've had the pleasure to work with
        </p>
      </div>

      <div className="testimonials__container">
        <button 
          className="testimonials__nav testimonials__nav--prev"
          onClick={prevTestimonial}
          aria-label="Previous testimonial"
        >
          <FaChevronLeft />
        </button>

        <div className="testimonials__content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="testimonials__card glass"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="testimonials__quote">
                <FaQuoteLeft className="testimonials__quote-icon" />
              </div>
              
              <div className="testimonials__rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={`testimonials__star ${i < currentTestimonial.rating ? 'active' : ''}`}
                  />
                ))}
              </div>

              <p className="testimonials__text">
                "{currentTestimonial.content}"
              </p>

              <div className="testimonials__author">
                <img 
                  src={currentTestimonial.client_avatar || `https://via.placeholder.com/80x80/7c3aed/ffffff?text=${currentTestimonial.client_name?.charAt(0) || 'U'}`}
                  alt={currentTestimonial.client_name}
                  className="testimonials__avatar"
                />
                <div className="testimonials__author-info">
                  <h4 className="testimonials__name">{currentTestimonial.client_name}</h4>
                  <p className="testimonials__role">
                    {currentTestimonial.client_role} at {currentTestimonial.client_company}
                  </p>
                  {currentTestimonial.project_name && (
                    <span className="testimonials__project">
                      Project: {currentTestimonial.project_name}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button 
          className="testimonials__nav testimonials__nav--next"
          onClick={nextTestimonial}
          aria-label="Next testimonial"
        >
          <FaChevronRight />
        </button>
      </div>

      <div className="testimonials__dots">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`testimonials__dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToTestimonial(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      <div className="testimonials__stats">
        <div className="testimonials__stat glass">
          <span className="testimonials__stat-value gradient-text">{testimonials.length}+</span>
          <span className="testimonials__stat-label">Happy Clients</span>
        </div>
        <div className="testimonials__stat glass">
          <span className="testimonials__stat-value gradient-text">
            {testimonials.length > 0 ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1) : '5.0'}
          </span>
          <span className="testimonials__stat-label">Average Rating</span>
        </div>
        <div className="testimonials__stat glass">
          <span className="testimonials__stat-value gradient-text">100%</span>
          <span className="testimonials__stat-label">Project Success</span>
        </div>
      </div>
    </SectionWrapper>
  );
}
