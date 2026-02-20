import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SectionWrapper from '../components/SectionWrapper';
import PageTransition from '../components/PageTransition';
import { publicApi } from '../api/client';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    content: '',
    honeypot: '', // Hidden field for spam detection
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.sender_name.trim()) newErrors.sender_name = 'Name is required';
    if (!formData.sender_email.trim()) {
      newErrors.sender_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email)) {
      newErrors.sender_email = 'Enter a valid email address';
    }
    if (!formData.content.trim()) newErrors.content = 'Message is required';
    else if (formData.content.trim().length < 10) newErrors.content = 'Message must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === 'sender_name') {
      if (!value.trim()) newErrors.sender_name = 'Name is required';
      else delete newErrors.sender_name;
    }
    if (name === 'sender_email') {
      if (!value.trim()) newErrors.sender_email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.sender_email = 'Enter a valid email';
      else delete newErrors.sender_email;
    }
    if (name === 'content') {
      if (!value.trim()) newErrors.content = 'Message is required';
      else if (value.trim().length < 10) newErrors.content = 'At least 10 characters';
      else delete newErrors.content;
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Real-time validation
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check honeypot
    if (formData.honeypot) {
      console.warn('Bot detected');
      return;
    }
    
    if (!validate()) {
      toast.error('Please fix the errors');
      return;
    }

    setIsSubmitting(true);
    try {
      await publicApi.sendMessage(formData);
      setIsSubmitted(true);
      toast.success("Message sent! I'll get back to you soon.");
      setFormData({ sender_name: '', sender_email: '', subject: '', content: '', honeypot: '' });
      setErrors({});
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 429) {
        toast.error('Too many messages. Please try again later.');
      } else {
        toast.error(detail || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Contact | Portfolio</title>
        <meta name="description" content="Get in touch — let's discuss your project or just say hello." />
      </Helmet>

      <div style={{ paddingTop: '5rem' }}>
        <SectionWrapper>
          <div className="contact__grid">
            {/* Info Side */}
            <motion.div
              className="contact__info"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h1 className="section-title">
                Let's <span className="gradient-text">Connect</span>
              </h1>
              <p className="contact__intro">
                Have a project in mind, a question, or just want to say hello?
                Fill out the form and I'll get back to you as soon as possible.
              </p>

              <div className="contact__details">
                <div className="contact__detail">
                  <div className="contact__detail-icon">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h4>Email</h4>
                    <p>hello@example.com</p>
                  </div>
                </div>
                <div className="contact__detail">
                  <div className="contact__detail-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h4>Location</h4>
                    <p>India</p>
                  </div>
                </div>
              </div>

              {/* Decorative gradient card */}
              <div className="contact__decor glass">
                <p className="contact__decor-text">
                  "The best way to predict the future is to create it."
                </p>
                <span className="contact__decor-author">— Peter Drucker</span>
              </div>
            </motion.div>

            {/* Form Side */}
            <motion.div
              className="contact__form-wrapper glass"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {isSubmitted ? (
                <div className="contact__success">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <div className="contact__success-icon">✉️</div>
                    <h3>Message Sent!</h3>
                    <p>Thanks for reaching out. I'll get back to you soon.</p>
                    <button
                      className="btn btn-outline"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another
                    </button>
                  </motion.div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact__form" noValidate>
                  {/* Honeypot — hidden from users */}
                  <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="form-group">
                    <label className="form-label" htmlFor="sender_name">Name *</label>
                    <input
                      id="sender_name"
                      name="sender_name"
                      type="text"
                      className={`form-input ${errors.sender_name ? 'form-input--error' : ''}`}
                      placeholder="Your name"
                      value={formData.sender_name}
                      onChange={handleChange}
                      onBlur={(e) => validateField('sender_name', e.target.value)}
                      aria-invalid={!!errors.sender_name}
                      aria-describedby={errors.sender_name ? 'name-error' : undefined}
                    />
                    {errors.sender_name && <span id="name-error" className="form-error" role="alert">{errors.sender_name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="sender_email">Email *</label>
                    <input
                      id="sender_email"
                      name="sender_email"
                      type="email"
                      className={`form-input ${errors.sender_email ? 'form-input--error' : ''}`}
                      placeholder="your@email.com"
                      value={formData.sender_email}
                      onChange={handleChange}
                      onBlur={(e) => validateField('sender_email', e.target.value)}
                      aria-invalid={!!errors.sender_email}
                      aria-describedby={errors.sender_email ? 'email-error' : undefined}
                    />
                    {errors.sender_email && <span id="email-error" className="form-error" role="alert">{errors.sender_email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      className="form-input"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="content">Message *</label>
                    <textarea
                      id="content"
                      name="content"
                      className={`form-textarea ${errors.content ? 'form-input--error' : ''}`}
                      placeholder="Tell me about your project..."
                      rows={5}
                      value={formData.content}
                      onChange={handleChange}
                      onBlur={(e) => validateField('content', e.target.value)}
                      aria-invalid={!!errors.content}
                      aria-describedby={errors.content ? 'content-error' : undefined}
                    />
                    {errors.content && <span id="content-error" className="form-error" role="alert">{errors.content}</span>}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg contact__submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      <>Send Message <FaPaperPlane /></>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </SectionWrapper>
      </div>
    </PageTransition>
  );
}
