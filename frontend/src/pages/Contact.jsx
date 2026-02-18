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
    } else if (!/\S+@\S+\.\S+/.test(formData.sender_email)) {
      newErrors.sender_email = 'Enter a valid email address';
    }
    if (!formData.content.trim()) newErrors.content = 'Message is required';
    if (formData.content.trim().length < 10) newErrors.content = 'Message must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await publicApi.sendMessage(formData);
      setIsSubmitted(true);
      toast.success("Message sent! I'll get back to you soon.");
      setFormData({ sender_name: '', sender_email: '', subject: '', content: '', honeypot: '' });
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
                    />
                    {errors.sender_name && <span className="form-error">{errors.sender_name}</span>}
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
                    />
                    {errors.sender_email && <span className="form-error">{errors.sender_email}</span>}
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
                    />
                    {errors.content && <span className="form-error">{errors.content}</span>}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg contact__submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Sending...</>
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
