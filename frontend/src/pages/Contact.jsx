import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaUser, FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SectionWrapper from '../components/SectionWrapper';
import PageTransition from '../components/PageTransition';
import FormField from '../components/FormField';
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

                  <FormField
                    label="Name"
                    name="sender_name"
                    value={formData.sender_name}
                    onChange={handleChange}
                    error={errors.sender_name}
                    icon={FaUser}
                    placeholder="Your name"
                    required
                  />

                  <FormField
                    label="Email"
                    name="sender_email"
                    type="email"
                    value={formData.sender_email}
                    onChange={handleChange}
                    error={errors.sender_email}
                    icon={FaEnvelope}
                    placeholder="your@email.com"
                    required
                  />

                  <FormField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    icon={FaFileAlt}
                    placeholder="What's this about?"
                    hint="Optional but helpful"
                  />

                  <FormField
                    label="Message"
                    name="content"
                    type="textarea"
                    value={formData.content}
                    onChange={handleChange}
                    error={errors.content}
                    icon={FaFileAlt}
                    placeholder="Tell me about your project..."
                    rows={5}
                    hint="At least 10 characters"
                    required
                  />

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
