import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaStar, FaProjectDiagram, FaTag, FaFileAlt, FaImage, FaCalendar, FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';

const CATEGORY_CHOICES = [
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'automation', label: 'Automation' },
  { value: 'other', label: 'Other' },
];

const EMPTY_PROJECT = {
  title: '', slug: '', short_description: '', description: '',
  thumbnail: '', category: 'other', live_url: '', repo_url: '',
  is_featured: false, is_visible: true, order: 0, date_built: '',
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PROJECT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    userApi.getProjects()
      .then(res => {
        const data = res.data.results || res.data;
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const openCreateForm = () => {
    setEditingProject(null);
    setFormData(EMPTY_PROJECT);
    setShowForm(true);
  };

  const openEditForm = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      slug: project.slug || '',
      short_description: project.short_description || '',
      description: project.description || '',
      thumbnail: project.thumbnail || '',
      category: project.category || 'other',
      live_url: project.live_url || '',
      repo_url: project.repo_url || '',
      is_featured: project.is_featured || false,
      is_visible: project.is_visible !== false,
      order: project.order || 0,
      date_built: project.date_built || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProject) {
        await userApi.updateProject(editingProject.id, formData);
        toast.success('Project updated!');
      } else {
        await userApi.createProject(formData);
        toast.success('Project created!');
      }
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      const errors = err.response?.data;
      const msg = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : 'Something went wrong';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await userApi.deleteProject(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
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
          <h1>Projects</h1>
          <p>Manage your portfolio projects</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreateForm}>
          <FaPlus /> New Project
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
            onClick={() => setShowForm(false)}
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
                {editingProject ? 'Edit Project' : 'New Project'}
              </h2>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form__row">
                  <FormField
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    icon={FaProjectDiagram}
                    placeholder="Project title"
                    required
                  />
                  <FormField
                    label="Category"
                    name="category"
                    type="select"
                    value={formData.category}
                    onChange={handleChange}
                    icon={FaTag}
                    options={CATEGORY_CHOICES}
                  />
                </div>
                
                <FormField
                  label="Short Description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  icon={FaFileAlt}
                  placeholder="One-liner for card view"
                  hint="Brief description shown on project cards"
                />
                
                <FormField
                  label="Full Description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={handleChange}
                  icon={FaFileAlt}
                  placeholder="Detailed description (supports markdown)"
                  rows={4}
                  hint="Detailed project description with markdown support"
                />
                
                <div className="admin-form__row">
                  <FormField
                    label="Thumbnail URL"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    icon={FaImage}
                    placeholder="Image URL"
                    hint="Project thumbnail image"
                  />
                  <FormField
                    label="Date Built"
                    name="date_built"
                    type="date"
                    value={formData.date_built}
                    onChange={handleChange}
                    icon={FaCalendar}
                  />
                </div>
                
                <div className="admin-form__row">
                  <FormField
                    label="Live URL"
                    name="live_url"
                    value={formData.live_url}
                    onChange={handleChange}
                    icon={FaExternalLinkAlt}
                    placeholder="https://..."
                    hint="Live demo or production URL"
                  />
                  <FormField
                    label="Repository URL"
                    name="repo_url"
                    value={formData.repo_url}
                    onChange={handleChange}
                    icon={FaGithub}
                    placeholder="https://github.com/..."
                    hint="Source code repository"
                  />
                </div>
                
                <div className="admin-form__row">
                  <FormField
                    label="Featured Project"
                    name="is_featured"
                    type="checkbox"
                    value={formData.is_featured}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Visible to Public"
                    name="is_visible"
                    type="checkbox"
                    value={formData.is_visible}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingProject ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Table */}
      {loading ? (
        <LoadingSkeleton variant="text" count={5} />
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>No projects yet. Click "New Project" to create one.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {project.title}
                    {project.is_featured && <FaStar style={{ color: '#eab308', marginLeft: '0.5rem', fontSize: '0.7rem' }} />}
                  </td>
                  <td><span className="chip">{project.category}</span></td>
                  <td>
                    {project.is_visible
                      ? <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaEye /> Visible</span>
                      : <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaEyeSlash /> Hidden</span>
                    }
                  </td>
                  <td>{project.order}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--edit" onClick={() => openEditForm(project)}>
                        <FaEdit /> Edit
                      </button>
                      <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(project.id)}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
