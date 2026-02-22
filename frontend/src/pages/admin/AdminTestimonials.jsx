import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  FaBuilding,
  FaEdit,
  FaFilter,
  FaImage,
  FaPlus,
  FaProjectDiagram,
  FaSearch,
  FaSort,
  FaStar,
  FaTrash,
  FaUser,
  FaUserTie,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';
import FileUploader from '../../components/FileUploader';

const EMPTY_TESTIMONIAL = {
  client_name: '',
  client_role: '',
  client_company: '',
  client_avatar: '',
  content: '',
  rating: 5,
  project_name: '',
  is_featured: false,
  order: 0,
};

const RATING_FILTERS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4+ Stars' },
  { value: '3', label: '3+ Stars' },
];

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState(EMPTY_TESTIMONIAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await userApi.getTestimonials();
      const data = response.data?.results || response.data || [];
      setTestimonials(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const sortedFilteredTestimonials = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const ratingMin = ratingFilter === 'all' ? 0 : parseInt(ratingFilter, 10);
    return testimonials
      .filter((item) => {
        const matchesSearch =
          !term ||
          [
            item.client_name,
            item.client_role,
            item.client_company,
            item.project_name,
            item.content,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term));
        const rating = Math.max(0, Math.min(5, Number(item.rating) || 0));
        return matchesSearch && rating >= ratingMin;
      })
      .sort((a, b) => {
        const leftOrder = Number(a.order) || 0;
        const rightOrder = Number(b.order) || 0;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        const leftDate = new Date(a.created_at || 0).getTime();
        const rightDate = new Date(b.created_at || 0).getTime();
        return rightDate - leftDate;
      });
  }, [testimonials, searchTerm, ratingFilter]);

  const openCreate = () => {
    setEditingTestimonial(null);
    setFormData(EMPTY_TESTIMONIAL);
    setShowForm(true);
  };

  const openEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name || '',
      client_role: testimonial.client_role || '',
      client_company: testimonial.client_company || '',
      client_avatar: testimonial.client_avatar || '',
      content: testimonial.content || '',
      rating: Math.max(1, Math.min(5, Number(testimonial.rating) || 5)),
      project_name: testimonial.project_name || '',
      is_featured: Boolean(testimonial.is_featured),
      order: Number(testimonial.order) || 0,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTestimonial(null);
    setFormData(EMPTY_TESTIMONIAL);
    setIsSubmitting(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'order' || name === 'rating'
          ? Number(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      client_name: normalizeText(formData.client_name),
      client_role: normalizeText(formData.client_role),
      client_company: normalizeText(formData.client_company),
      client_avatar: normalizeText(formData.client_avatar),
      project_name: normalizeText(formData.project_name),
      content: normalizeText(formData.content),
      rating: Math.max(1, Math.min(5, Number(formData.rating) || 5)),
      order: Number(formData.order) || 0,
    };

    if (!payload.client_name || !payload.client_role || !payload.client_company || !payload.content) {
      toast.error('Name, role, company, and testimonial content are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTestimonial) {
        await userApi.updateTestimonial(editingTestimonial.id, payload);
        toast.success('Testimonial updated');
      } else {
        await userApi.createTestimonial(payload);
        toast.success('Testimonial created');
      }
      await fetchTestimonials();
      closeForm();
    } catch (error) {
      const errors = error.response?.data;
      const message = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : 'Failed to save testimonial';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await userApi.deleteTestimonial(id);
      toast.success('Testimonial deleted');
      await fetchTestimonials();
    } catch {
      toast.error('Failed to delete testimonial');
    }
  };

  return (
    <div className="admin-content-page">
      <div className="admin-page-header admin-content-page__header">
        <div>
          <h1>Testimonials</h1>
          <p>Show client feedback with clear ordering and quality.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <FaPlus /> Add Testimonial
        </button>
      </div>

      <div className="admin-content-toolbar glass">
        <label className="admin-panel__search">
          <FaSearch />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by client, company, project or text"
            aria-label="Search testimonials"
          />
        </label>
        <label className="admin-content-filter">
          <FaFilter />
          <select
            className="form-input"
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            aria-label="Filter by rating"
          >
            {RATING_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <AnimatePresence>
        {showForm && (
          <Motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForm}
          >
            <Motion.div
              className="admin-form-modal admin-form-modal--testimonial glass"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-form-modal__header">
                <h2>{editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}</h2>
                <p>
                  {editingTestimonial
                    ? 'Update the client details and refine the testimonial copy.'
                    : 'Add client details and write clear, concise testimonial feedback.'}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form__row">
                  <FormField
                    label="Client Name"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    icon={FaUser}
                    required
                  />
                  <FormField
                    label="Client Role"
                    name="client_role"
                    value={formData.client_role}
                    onChange={handleChange}
                    icon={FaUserTie}
                    required
                  />
                </div>

                <div className="admin-form__row">
                  <FormField
                    label="Company"
                    name="client_company"
                    value={formData.client_company}
                    onChange={handleChange}
                    icon={FaBuilding}
                    required
                  />
                  <FormField
                    label="Project Name"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                    icon={FaProjectDiagram}
                    hint="Optional"
                  />
                </div>

                <FormField
                  label="Avatar URL"
                  name="client_avatar"
                  value={formData.client_avatar}
                  onChange={handleChange}
                  icon={FaImage}
                  placeholder="https://example.com/avatar.jpg"
                />
                <FileUploader
                  label="Upload Client Avatar"
                  accept="image/*"
                  buttonText="Upload Avatar"
                  onUploaded={(url) => setFormData((prev) => ({ ...prev, client_avatar: url }))}
                />

                {formData.client_avatar && (
                  <div className="admin-avatar-preview">
                    <img src={formData.client_avatar} alt="Client avatar preview" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  </div>
                )}

                <FormField
                  label="Testimonial Content"
                  name="content"
                  type="textarea"
                  value={formData.content}
                  onChange={handleChange}
                  rows={6}
                  maxLength={520}
                  hint={`${formData.content.length}/520 characters`}
                  required
                />

                <div className="admin-form__row">
                  <div className="admin-rating-picker">
                    <p className="form-label">Rating</p>
                    <div className="admin-rating-picker__stars">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`admin-rating-picker__star ${value <= formData.rating ? 'active' : ''}`}
                          onClick={() => setFormData((prev) => ({ ...prev, rating: value }))}
                          aria-label={`Set rating to ${value}`}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                  </div>
                  <FormField
                    label="Display Order"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleChange}
                    icon={FaSort}
                    hint="Lower appears first"
                  />
                </div>

                <FormField
                  label="Featured Testimonial"
                  name="is_featured"
                  type="checkbox"
                  value={formData.is_featured}
                  onChange={handleChange}
                />

                <div className="form-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={closeForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                  </button>
                </div>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <LoadingSkeleton variant="text" count={7} />
      ) : sortedFilteredTestimonials.length === 0 ? (
        <div className="admin-panel__empty glass">
          <p>No testimonials match the current filter.</p>
        </div>
      ) : (
        <div className="admin-content-grid">
          {sortedFilteredTestimonials.map((item, index) => {
            const rating = Math.max(0, Math.min(5, Number(item.rating) || 0));
            const displayName = item.client_name || 'Client';
            return (
              <Motion.article
                key={item.id}
                className="admin-content-card admin-content-card--testimonial glass"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className="admin-content-card__body admin-content-card__body--testimonial">
                  <div className="admin-testimonial__head">
                    <div className="admin-testimonial__avatar">
                      {item.client_avatar ? (
                        <img src={item.client_avatar} alt={displayName} />
                      ) : (
                        <span>{displayName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3>{displayName}</h3>
                      <p>{item.client_role || 'Client'} at {item.client_company || 'Company'}</p>
                    </div>
                  </div>

                  <div className="admin-testimonial__rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={`${item.id}-${i}`} className={i < rating ? 'active' : ''} />
                    ))}
                    <span>{rating}.0</span>
                  </div>

                  <p className="admin-testimonial__content">{item.content || 'No testimonial content.'}</p>

                  <div className="admin-content-card__chips">
                    {item.project_name && <span className="chip">Project: {item.project_name}</span>}
                    {item.is_featured && <span className="chip chip-status-admin">Featured</span>}
                    <span className="chip">Order: {Number(item.order) || 0}</span>
                  </div>

                  <div className="admin-content-card__actions">
                    <button type="button" className="admin-btn admin-btn--edit" onClick={() => openEdit(item)}>
                      <FaEdit /> Edit
                    </button>
                    <button type="button" className="admin-btn admin-btn--delete" onClick={() => handleDelete(item.id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </Motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
