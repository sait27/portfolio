import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaBriefcase, FaCalendarAlt, FaBuilding, FaExternalLinkAlt, FaSort } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';

const EMPTY_EXPERIENCE = {
  role: '', company: '', company_url: '',
  start_date: '', end_date: '', is_current: false,
  highlights: [], order: 0,
};

export default function AdminExperience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_EXPERIENCE);
  const [highlightInput, setHighlightInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    userApi.getExperience()
      .then(res => {
        const data = res.data.results || res.data;
        setExperiences(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error('Failed to load experience'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_EXPERIENCE);
    setHighlightInput('');
    setShowForm(true);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setFormData({
      role: exp.role || '',
      company: exp.company || '',
      company_url: exp.company_url || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      is_current: exp.is_current || false,
      highlights: Array.isArray(exp.highlights) ? exp.highlights : [],
      order: exp.order || 0,
    });
    setHighlightInput('');
    setShowForm(true);
  };

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData(p => ({ ...p, highlights: [...p.highlights, highlightInput.trim()] }));
    setHighlightInput('');
  };

  const removeHighlight = (idx) => {
    setFormData(p => ({
      ...p,
      highlights: p.highlights.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role.trim() || !formData.company.trim()) {
      return toast.error('Role and company are required');
    }
    if (!formData.start_date) return toast.error('Start date is required');

    setIsSubmitting(true);
    const payload = { ...formData };
    if (payload.is_current) payload.end_date = null;
    if (!payload.end_date) payload.end_date = null;

    try {
      if (editing) {
        await userApi.updateExperience(editing.id, payload);
        toast.success('Experience updated!');
      } else {
        await userApi.createExperience(payload);
        toast.success('Experience created!');
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      const msg = typeof err.response?.data === 'object'
        ? Object.values(err.response.data).flat().join(', ')
        : 'Failed to save';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience entry?')) return;
    try {
      await userApi.deleteExperience(id);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Experience</h1>
          <p>Manage your professional timeline</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <FaPlus /> Add Experience
        </button>
      </div>

      {/* ── Form Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} style={{ zIndex: 200 }}>
            <motion.div className="admin-form-modal glass" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '1.5rem' }}>{editing ? 'Edit Experience' : 'New Experience'}</h2>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form__row">
                  <FormField
                    label="Role / Title"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    icon={FaBriefcase}
                    placeholder="e.g., Full Stack Developer"
                    required
                  />
                  <FormField
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    icon={FaBuilding}
                    placeholder="e.g., Google"
                    required
                  />
                </div>
                
                <FormField
                  label="Company URL"
                  name="company_url"
                  value={formData.company_url}
                  onChange={handleChange}
                  icon={FaExternalLinkAlt}
                  placeholder="https://..."
                  hint="Optional company website"
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
                    hint={formData.is_current ? "Disabled for current role" : "Leave empty if current"}
                  />
                </div>
                
                <FormField
                  label="I currently work here"
                  name="is_current"
                  type="checkbox"
                  value={formData.is_current}
                  onChange={handleChange}
                />

                {/* Highlights */}
                <div className="form-group">
                  <label className="form-label">Key Achievements / Highlights</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="form-input" value={highlightInput} onChange={e => setHighlightInput(e.target.value)} placeholder="e.g., Built a real-time dashboard" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); }}} />
                    <button type="button" className="btn btn-outline btn-sm" onClick={addHighlight}>Add</button>
                  </div>
                  {formData.highlights.length > 0 && (
                    <ul style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {formData.highlights.map((h, i) => (
                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          <span>▹ {h}</span>
                          <button type="button" onClick={() => removeHighlight(i)} style={{ color: '#ef4444', fontSize: '0.7rem', padding: '0.25rem' }}>✕</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <FormField
                  label="Order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleChange}
                  icon={FaSort}
                  hint="Lower numbers appear first"
                />

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editing ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Experience List ──────────────────────────────────────────── */}
      {loading ? (
        <LoadingSkeleton variant="text" count={4} />
      ) : experiences.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <FaBriefcase style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          <p>No experience entries yet. Add your first role!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              className="admin-exp-card glass"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {exp.role}
                  </h3>
                  <p style={{ color: 'var(--accent-secondary)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaBriefcase style={{ fontSize: '0.7rem' }} /> {exp.company}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FaCalendarAlt style={{ fontSize: '0.6rem' }} />
                    {exp.start_date} — {exp.is_current ? <span className="chip chip-active" style={{ fontSize: '0.6rem' }}>Present</span> : exp.end_date}
                  </p>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul style={{ marginTop: '0.75rem', paddingLeft: '0.75rem' }}>
                      {exp.highlights.map((h, j) => (
                        <li key={j} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                          ▹ {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="admin-actions">
                  <button className="admin-btn admin-btn--edit" onClick={() => openEdit(exp)}><FaEdit /> Edit</button>
                  <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(exp.id)}><FaTrash /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
