import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaEdit,
  FaExternalLinkAlt,
  FaPlus,
  FaSort,
  FaTrash,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';

const EMPTY_EXPERIENCE = {
  role: '',
  company: '',
  company_url: '',
  start_date: '',
  end_date: '',
  is_current: false,
  highlights: [],
  order: 0,
};

const formatMonthYear = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

export default function AdminExperience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_EXPERIENCE);
  const [highlightInput, setHighlightInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await userApi.getExperience();
      const data = response.data?.results || response.data || [];
      setExperiences(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load experience');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sortedExperiences = useMemo(
    () =>
      [...experiences].sort((a, b) => {
        const leftOrder = Number(a.order) || 0;
        const rightOrder = Number(b.order) || 0;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        const leftDate = new Date(a.start_date || 0).getTime();
        const rightDate = new Date(b.start_date || 0).getTime();
        return rightDate - leftDate;
      }),
    [experiences]
  );

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_EXPERIENCE);
    setHighlightInput('');
    setShowForm(true);
  };

  const openEdit = (experience) => {
    setEditing(experience);
    setFormData({
      role: experience.role || '',
      company: experience.company || '',
      company_url: experience.company_url || '',
      start_date: experience.start_date || '',
      end_date: experience.end_date || '',
      is_current: Boolean(experience.is_current),
      highlights: Array.isArray(experience.highlights) ? experience.highlights : [],
      order: Number(experience.order) || 0,
    });
    setHighlightInput('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData(EMPTY_EXPERIENCE);
    setHighlightInput('');
    setIsSubmitting(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addHighlight = () => {
    const value = normalizeText(highlightInput);
    if (!value) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, value],
    }));
    setHighlightInput('');
  };

  const removeHighlight = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...formData,
      role: normalizeText(formData.role),
      company: normalizeText(formData.company),
      company_url: normalizeText(formData.company_url),
      order: Number(formData.order) || 0,
      highlights: formData.highlights.map((item) => normalizeText(item)).filter(Boolean),
    };

    if (!payload.role || !payload.company || !payload.start_date) {
      toast.error('Role, company, and start date are required');
      return;
    }

    if (payload.is_current) {
      payload.end_date = null;
    } else if (!payload.end_date) {
      payload.end_date = null;
    }

    setIsSubmitting(true);
    try {
      if (editing) {
        await userApi.updateExperience(editing.id, payload);
        toast.success('Experience updated');
      } else {
        await userApi.createExperience(payload);
        toast.success('Experience created');
      }
      await fetchData();
      closeForm();
    } catch (error) {
      const errors = error.response?.data;
      const message = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : 'Failed to save experience';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience entry?')) return;
    try {
      await userApi.deleteExperience(id);
      toast.success('Experience deleted');
      await fetchData();
    } catch {
      toast.error('Failed to delete experience');
    }
  };

  return (
    <div className="admin-content-page">
      <div className="admin-page-header admin-content-page__header">
        <div>
          <h1>Experience</h1>
          <p>Maintain your timeline with clear highlights and ordering.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <FaPlus /> Add Experience
        </button>
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
              className="admin-form-modal glass"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2>{editing ? 'Edit Experience' : 'New Experience'}</h2>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form__row">
                  <FormField
                    label="Role / Title"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    icon={FaBriefcase}
                    required
                  />
                  <FormField
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    icon={FaBuilding}
                    required
                  />
                </div>

                <FormField
                  label="Company URL"
                  name="company_url"
                  value={formData.company_url}
                  onChange={handleChange}
                  icon={FaExternalLinkAlt}
                />

                <div className="admin-form__row">
                  <FormField
                    label="Start Date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    icon={FaCalendarAlt}
                    required
                  />
                  <FormField
                    label="End Date"
                    name="end_date"
                    type="date"
                    value={formData.end_date || ''}
                    onChange={handleChange}
                    icon={FaCalendarAlt}
                    disabled={formData.is_current}
                    hint={formData.is_current ? 'Disabled for current role' : 'Leave empty if current'}
                  />
                </div>

                <FormField
                  label="I currently work here"
                  name="is_current"
                  type="checkbox"
                  value={formData.is_current}
                  onChange={handleChange}
                />

                <div className="admin-highlight-block">
                  <label className="form-label" htmlFor="highlight-input">Key Highlights</label>
                  <div className="admin-highlight-input">
                    <input
                      id="highlight-input"
                      className="form-input"
                      value={highlightInput}
                      onChange={(event) => setHighlightInput(event.target.value)}
                      placeholder="Example: Reduced API response time by 35%"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addHighlight();
                        }
                      }}
                    />
                    <button type="button" className="btn btn-outline btn-sm" onClick={addHighlight}>
                      Add
                    </button>
                  </div>

                  {formData.highlights.length > 0 && (
                    <ul className="admin-highlight-list">
                      {formData.highlights.map((item, index) => (
                        <li key={`${item}-${index}`} className="admin-highlight-list__item">
                          <span>{item}</span>
                          <button type="button" onClick={() => removeHighlight(index)} aria-label="Remove highlight">
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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

                <div className="form-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={closeForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editing ? 'Update Experience' : 'Create Experience'}
                  </button>
                </div>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <LoadingSkeleton variant="text" count={6} />
      ) : sortedExperiences.length === 0 ? (
        <div className="admin-panel__empty glass">
          <p>No experience entries yet. Add your first role.</p>
        </div>
      ) : (
        <div className="admin-experience-list">
          {sortedExperiences.map((experience, index) => {
            const period = `${formatMonthYear(experience.start_date)} - ${experience.is_current ? 'Present' : formatMonthYear(experience.end_date)}`;
            return (
              <Motion.article
                key={experience.id}
                className="admin-exp-card glass"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="admin-exp-card__header">
                  <div>
                    <h3>{experience.role}</h3>
                    <p>{experience.company}</p>
                    <div className="admin-exp-card__meta">
                      <span><FaCalendarAlt /> {period}</span>
                      <span>Order: {Number(experience.order) || 0}</span>
                      {experience.is_current && <span className="chip chip-status-active">Current</span>}
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn admin-btn--edit" onClick={() => openEdit(experience)}>
                      <FaEdit /> Edit
                    </button>
                    <button type="button" className="admin-btn admin-btn--delete" onClick={() => handleDelete(experience.id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>

                {Array.isArray(experience.highlights) && experience.highlights.length > 0 && (
                  <ul className="admin-exp-card__highlights">
                    {experience.highlights.map((highlight, idx) => (
                      <li key={`${highlight}-${idx}`}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </Motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
