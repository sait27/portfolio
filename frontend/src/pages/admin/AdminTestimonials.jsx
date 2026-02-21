import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaStar, FaUser, FaBriefcase, FaBuilding, FaImage, FaFileAlt, FaProjectDiagram, FaSort } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    client_name: '',
    client_role: '',
    client_company: '',
    client_avatar: '',
    content: '',
    rating: 5,
    project_name: '',
    is_featured: false,
    order: 0
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await userApi.getTestimonials();
      setTestimonials(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await userApi.updateTestimonial(editingTestimonial.id, formData);
        toast.success('Testimonial updated!');
      } else {
        await userApi.createTestimonial(formData);
        toast.success('Testimonial created!');
      }
      
      fetchTestimonials();
      resetForm();
    } catch (error) {
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await userApi.deleteTestimonial(id);
        toast.success('Testimonial deleted');
        fetchTestimonials();
      } catch (error) {
        toast.error('Failed to delete testimonial');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_role: '',
      client_company: '',
      client_avatar: '',
      content: '',
      rating: 5,
      project_name: '',
      is_featured: false,
      order: 0
    });
    setEditingTestimonial(null);
    setShowForm(false);
  };

  const startEdit = (testimonial) => {
    setFormData(testimonial);
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  if (loading) return <LoadingSkeleton variant="text" count={5} />;

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Testimonials</h1>
          <p>Manage client feedback and reviews</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          <FaPlus /> Add Testimonial
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
            style={{ zIndex: 200 }}
          >
            <motion.div
              className="admin-form-modal glass"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '1.5rem' }}>
                {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
              </h2>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form__row">
                  <FormField
                    label="Client Name"
                    name="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    icon={FaUser}
                    placeholder="John Doe"
                    required
                  />
                  <FormField
                    label="Client Role"
                    name="client_role"
                    value={formData.client_role}
                    onChange={(e) => setFormData({...formData, client_role: e.target.value})}
                    icon={FaBriefcase}
                    placeholder="CEO, CTO, etc."
                    required
                  />
                </div>

                <div className="admin-form__row">
                  <FormField
                    label="Company"
                    name="client_company"
                    value={formData.client_company}
                    onChange={(e) => setFormData({...formData, client_company: e.target.value})}
                    icon={FaBuilding}
                    placeholder="Company name"
                    required
                  />
                  <FormField
                    label="Project Name"
                    name="project_name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                    icon={FaProjectDiagram}
                    placeholder="Optional project name"
                    hint="Related project (optional)"
                  />
                </div>

                <FormField
                  label="Avatar URL"
                  name="client_avatar"
                  value={formData.client_avatar}
                  onChange={(e) => setFormData({...formData, client_avatar: e.target.value})}
                  icon={FaImage}
                  placeholder="https://example.com/avatar.jpg"
                  hint="Client profile picture"
                />
                
                {formData.client_avatar && (
                  <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <img 
                      src={formData.client_avatar} 
                      alt="Avatar preview" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }} 
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                <FormField
                  label="Testimonial Content"
                  name="content"
                  type="textarea"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  icon={FaFileAlt}
                  placeholder="Share the client's feedback and experience..."
                  rows={6}
                  hint={`${formData.content.length}/500 characters`}
                  required
                />

                <div className="admin-form__row">
                  <FormField
                    label="Rating"
                    name="rating"
                    type="select"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                    icon={FaStar}
                    options={[1, 2, 3, 4, 5].map(rating => ({ 
                      value: rating, 
                      label: `${rating} Star${rating > 1 ? 's' : ''}` 
                    }))}
                  />
                  <FormField
                    label="Order"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    icon={FaSort}
                    hint="Lower numbers appear first"
                  />
                </div>

                <FormField
                  label="Featured Testimonial"
                  name="is_featured"
                  type="checkbox"
                  value={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                />

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingTestimonial ? 'Update' : 'Create'} Testimonial
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="admin-card glass">
            <div className="admin-card__content">
              <div className="testimonial-header">
                {testimonial.client_avatar && (
                  <img src={testimonial.client_avatar} alt={testimonial.client_name} className="avatar" />
                )}
                <div>
                  <h3>{testimonial.client_name}</h3>
                  <p>{testimonial.client_role} at {testimonial.client_company}</p>
                </div>
              </div>
              
              <div className="rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} className={i < testimonial.rating ? 'active' : ''} />
                ))}
              </div>
              
              <p className="testimonial-content">"{testimonial.content}"</p>
              
              {testimonial.project_name && (
                <p className="project-name">Project: {testimonial.project_name}</p>
              )}
              
              <div className="admin-card__meta">
                {testimonial.is_featured && <span className="featured">Featured</span>}
                <span className="order">Order: {testimonial.order}</span>
              </div>
              
              <div className="admin-card__actions">
                <button className="btn btn-sm btn-secondary" onClick={() => startEdit(testimonial)}>
                  <FaEdit />
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(testimonial.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="empty-state">
          <h3>No testimonials yet</h3>
          <p>Add your first testimonial to showcase client feedback.</p>
        </div>
      )}
    </div>
  );
}