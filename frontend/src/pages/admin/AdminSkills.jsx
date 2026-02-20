import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaFolderOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const EMPTY_CATEGORY = { name: '', order: 0 };
const EMPTY_SKILL = { name: '', icon: '', category: '', order: 0 };

export default function AdminSkills() {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState(EMPTY_CATEGORY);

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillForm, setSkillForm] = useState(EMPTY_SKILL);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, skillRes] = await Promise.all([
        userApi.getCategories(),
        userApi.getSkills(),
      ]);
      const catData = catRes.data.results || catRes.data;
      const skillData = skillRes.data.results || skillRes.data;
      setCategories(Array.isArray(catData) ? catData : []);
      setSkills(Array.isArray(skillData) ? skillData : []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Category CRUD ──────────────────────────────────────────────────

  const openCatCreate = () => {
    setEditingCat(null);
    setCatForm(EMPTY_CATEGORY);
    setShowCatForm(true);
  };

  const openCatEdit = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, order: cat.order || 0 });
    setShowCatForm(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return toast.error('Name is required');
    setIsSubmitting(true);
    try {
      if (editingCat) {
        await userApi.updateCategory(editingCat.id, catForm);
        toast.success('Category updated!');
      } else {
        await userApi.createCategory(catForm);
        toast.success('Category created!');
      }
      setShowCatForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.name?.[0] || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCat = async (id) => {
    if (!window.confirm('Delete this category and all its skills?')) return;
    try {
      await userApi.deleteCategory(id);
      toast.success('Category deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ─── Skill CRUD ──────────────────────────────────────────────────

  const openSkillCreate = (catId) => {
    setEditingSkill(null);
    setSkillForm({ ...EMPTY_SKILL, category: catId || '' });
    setShowSkillForm(true);
  };

  const openSkillEdit = (skill) => {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name,
      icon: skill.icon || '',
      category: skill.category,
      order: skill.order || 0,
    });
    setShowSkillForm(true);
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    if (!skillForm.name.trim()) return toast.error('Name is required');
    if (!skillForm.category) return toast.error('Select a category');
    setIsSubmitting(true);
    try {
      if (editingSkill) {
        await userApi.updateSkill(editingSkill.id, skillForm);
        toast.success('Skill updated!');
      } else {
        await userApi.createSkill(skillForm);
        toast.success('Skill created!');
      }
      setShowSkillForm(false);
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

  const deleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await userApi.deleteSkill(id);
      toast.success('Skill deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ─── Group skills by category ───────────────────────────────────

  const skillsByCategory = categories.map(cat => ({
    ...cat,
    skills: skills.filter(s => s.category === cat.id),
  }));

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Skills & Categories</h1>
          <p>Manage your skill categories and individual skills</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={openCatCreate}>
            <FaFolderOpen /> New Category
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => openSkillCreate('')}>
            <FaPlus /> New Skill
          </button>
        </div>
      </div>

      {/* ─── Category Form Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showCatForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCatForm(false)} style={{ zIndex: 200 }}>
            <motion.div className="admin-form-modal glass" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '1.5rem' }}>{editingCat ? 'Edit Category' : 'New Category'}</h2>
              <form onSubmit={handleCatSubmit} className="admin-form">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input className="form-input" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Backend, Frontend, AI Models" />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input type="number" className="form-input" value={catForm.order} onChange={e => setCatForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCatForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingCat ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Skill Form Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showSkillForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSkillForm(false)} style={{ zIndex: 200 }}>
            <motion.div className="admin-form-modal glass" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '1.5rem' }}>{editingSkill ? 'Edit Skill' : 'New Skill'}</h2>
              <form onSubmit={handleSkillSubmit} className="admin-form">
                <div className="admin-form__row">
                  <div className="form-group">
                    <label className="form-label">Skill Name *</label>
                    <input className="form-input" value={skillForm.name} onChange={e => setSkillForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Python, React, Docker" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-input" value={skillForm.category} onChange={e => setSkillForm(p => ({ ...p, category: e.target.value }))}>
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="admin-form__row">
                  <div className="form-group">
                    <label className="form-label">Icon URL</label>
                    <input className="form-input" value={skillForm.icon} onChange={e => setSkillForm(p => ({ ...p, icon: e.target.value }))} placeholder="SVG or image URL" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order</label>
                    <input type="number" className="form-input" value={skillForm.order} onChange={e => setSkillForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowSkillForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingSkill ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Skills by Category Display ──────────────────────────────── */}
      {loading ? (
        <LoadingSkeleton variant="text" count={6} />
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <FaFolderOpen style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          <p>No categories yet. Create one to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {skillsByCategory.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="admin-skill-category glass"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="admin-skill-category__header">
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>{cat.name}</h3>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {cat.skills.length} skill{cat.skills.length !== 1 ? 's' : ''} · Order: {cat.order}
                  </span>
                </div>
                <div className="admin-actions">
                  <button className="admin-btn admin-btn--edit" onClick={() => openCatEdit(cat)}><FaEdit /> Edit</button>
                  <button className="admin-btn admin-btn--delete" onClick={() => deleteCat(cat.id)}><FaTrash /></button>
                  <button className="btn btn-primary btn-sm" onClick={() => openSkillCreate(cat.id)} style={{ marginLeft: '0.25rem' }}>
                    <FaPlus /> Add Skill
                  </button>
                </div>
              </div>

              {cat.skills.length > 0 && (
                <div className="admin-skill-list">
                  {cat.skills.map(skill => (
                    <div key={skill.id} className="admin-skill-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {skill.icon && <img src={skill.icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />}
                        <span style={{ fontWeight: 500 }}>{skill.name}</span>
                      </div>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn--edit" onClick={() => openSkillEdit(skill)}><FaEdit /></button>
                        <button className="admin-btn admin-btn--delete" onClick={() => deleteSkill(skill.id)}><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
