import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  FaCalendar,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaExternalLinkAlt,
  FaFilter,
  FaGithub,
  FaPlus,
  FaSearch,
  FaStar,
  FaTag,
  FaTrash,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';
import FileUploader from '../../components/FileUploader';

const CATEGORY_CHOICES = [
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'automation', label: 'Automation' },
  { value: 'other', label: 'Other' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Projects' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'featured', label: 'Featured' },
];

const CATEGORY_LABELS = Object.fromEntries(CATEGORY_CHOICES.map((item) => [item.value, item.label]));

const EMPTY_PROJECT = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  thumbnail: '',
  category: 'other',
  live_url: '',
  repo_url: '',
  is_featured: false,
  is_visible: true,
  order: 0,
  date_built: '',
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PROJECT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await userApi.getProjects();
      const data = response.data?.results || response.data || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return projects
      .filter((project) => {
        const matchesSearch =
          !term ||
          [project.title, project.short_description, project.description, project.category]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term));

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'visible' && project.is_visible) ||
          (statusFilter === 'hidden' && !project.is_visible) ||
          (statusFilter === 'featured' && project.is_featured);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const leftOrder = Number(a.order) || 0;
        const rightOrder = Number(b.order) || 0;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        const leftDate = new Date(a.date_built || 0).getTime();
        const rightDate = new Date(b.date_built || 0).getTime();
        return rightDate - leftDate;
      });
  }, [projects, searchTerm, statusFilter]);

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
      is_featured: Boolean(project.is_featured),
      is_visible: project.is_visible !== false,
      order: Number(project.order) || 0,
      date_built: project.date_built || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData(EMPTY_PROJECT);
    setIsSubmitting(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = normalizeText(formData.title);
    if (!title) {
      toast.error('Project title is required');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      title,
      slug: normalizeText(formData.slug),
      short_description: normalizeText(formData.short_description),
      description: normalizeText(formData.description),
      thumbnail: normalizeText(formData.thumbnail),
      category: normalizeText(formData.category) || 'other',
      live_url: normalizeText(formData.live_url),
      repo_url: normalizeText(formData.repo_url),
      order: Number(formData.order) || 0,
    };

    try {
      if (editingProject) {
        await userApi.updateProject(editingProject.id, payload);
        toast.success('Project updated');
      } else {
        await userApi.createProject(payload);
        toast.success('Project created');
      }
      await fetchProjects();
      closeForm();
    } catch (error) {
      const errors = error.response?.data;
      const message = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : 'Failed to save project';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await userApi.deleteProject(id);
      toast.success('Project deleted');
      await fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="admin-content-page">
      <div className="admin-page-header admin-content-page__header">
        <div>
          <h1>Projects</h1>
          <p>Control project visibility, order, and portfolio quality.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreateForm}>
          <FaPlus /> New Project
        </button>
      </div>

      <div className="admin-content-toolbar glass">
        <label className="admin-panel__search">
          <FaSearch />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, description, or category"
            aria-label="Search projects"
          />
        </label>
        <label className="admin-content-filter">
          <FaFilter />
          <select
            className="form-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter projects by status"
          >
            {STATUS_FILTERS.map((option) => (
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
              className="admin-form-modal admin-form-modal--wide glass"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2>{editingProject ? 'Edit Project' : 'New Project'}</h2>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form__row">
                  <FormField
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Category"
                    name="category"
                    type="select"
                    value={formData.category}
                    onChange={handleChange}
                    options={CATEGORY_CHOICES}
                  />
                </div>

                <div className="admin-form__row">
                  <FormField
                    label="Short Description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    hint="Shown on cards"
                  />
                  <FormField
                    label="Slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="optional-custom-slug"
                  />
                </div>

                <FormField
                  label="Full Description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                />

                <div className="admin-form__row">
                  <FormField
                    label="Thumbnail URL"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <FormField
                    label="Date Built"
                    name="date_built"
                    type="date"
                    value={formData.date_built}
                    onChange={handleChange}
                  />
                </div>
                <FileUploader
                  label="Upload Thumbnail"
                  accept="image/*"
                  buttonText="Upload Image"
                  onUploaded={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
                />

                {formData.thumbnail && (
                  <div className="admin-media-preview">
                    <img src={formData.thumbnail} alt="Project thumbnail preview" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  </div>
                )}

                <div className="admin-form__row">
                  <FormField
                    label="Live URL"
                    name="live_url"
                    value={formData.live_url}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Repository URL"
                    name="repo_url"
                    value={formData.repo_url}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-form__row">
                  <FormField
                    label="Display Order"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleChange}
                    hint="Lower appears first"
                  />
                  <div className="admin-form__checks">
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
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={closeForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <LoadingSkeleton variant="text" count={7} />
      ) : filteredProjects.length === 0 ? (
        <div className="admin-panel__empty glass">
          <p>No projects match the current filter.</p>
        </div>
      ) : (
        <div className="admin-content-grid admin-content-grid--projects">
          {filteredProjects.map((project, index) => (
            <Motion.article
              key={project.id}
              className="admin-content-card glass"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="admin-content-card__media">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.title} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="admin-content-card__placeholder">No Image</div>
                )}
              </div>

              <div className="admin-content-card__body">
                <div className="admin-content-card__chips">
                  <span className="chip"><FaTag /> {CATEGORY_LABELS[project.category] || project.category || 'Other'}</span>
                  <span className={`chip ${project.is_visible ? 'chip-status-active' : 'chip-status-inactive'}`}>
                    {project.is_visible ? <FaEye /> : <FaEyeSlash />}
                    {project.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                  {project.is_featured && (
                    <span className="chip chip-status-admin">
                      <FaStar /> Featured
                    </span>
                  )}
                </div>

                <h3>{project.title}</h3>
                <div className="admin-content-card__meta">
                  <span>Order: {Number(project.order) || 0}</span>
                  {project.date_built && (
                    <span><FaCalendar /> {project.date_built}</span>
                  )}
                </div>

                <p className="admin-content-card__excerpt">
                  {project.short_description || project.description || 'No description available.'}
                </p>

                <div className="admin-project-links">
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="chip">
                      <FaExternalLinkAlt /> Live
                    </a>
                  )}
                  {project.repo_url && (
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="chip">
                      <FaGithub /> Repo
                    </a>
                  )}
                </div>

                <div className="admin-content-card__actions">
                  <button type="button" className="admin-btn admin-btn--edit" onClick={() => openEditForm(project)}>
                    <FaEdit /> Edit
                  </button>
                  <button type="button" className="admin-btn admin-btn--delete" onClick={() => handleDelete(project.id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </Motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
