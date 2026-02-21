import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { FaClock, FaEdit, FaEye, FaEyeSlash, FaFilter, FaPlus, FaSearch, FaStar, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';

const EMPTY_POST = {
  title: '',
  excerpt: '',
  content: '',
  thumbnail: '',
  tags: '',
  read_time: '5 min read',
  is_published: false,
  is_featured: false,
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All Posts' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
  { value: 'featured', label: 'Featured' },
];

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const parseTags = (tags) =>
  String(tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState(EMPTY_POST);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await userApi.getBlogs();
      const data = response.data?.results || response.data || [];
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const sortedFilteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return posts
      .filter((post) => {
        const matchesSearch =
          !term ||
          [post.title, post.excerpt, ...(Array.isArray(post.tags) ? post.tags : [])]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term));

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' && post.is_published) ||
          (statusFilter === 'draft' && !post.is_published) ||
          (statusFilter === 'featured' && post.is_featured);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const left = new Date(a.published_at || a.created_at || 0).getTime();
        const right = new Date(b.published_at || b.created_at || 0).getTime();
        return right - left;
      });
  }, [posts, searchTerm, statusFilter]);

  const openCreate = () => {
    setEditingPost(null);
    setFormData(EMPTY_POST);
    setShowForm(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      thumbnail: post.thumbnail || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : String(post.tags || ''),
      read_time: post.read_time || '5 min read',
      is_published: Boolean(post.is_published),
      is_featured: Boolean(post.is_featured),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData(EMPTY_POST);
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
    const excerpt = normalizeText(formData.excerpt);
    const content = normalizeText(formData.content);

    if (!title || !excerpt || !content) {
      toast.error('Title, excerpt, and content are required');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      title,
      excerpt,
      content,
      thumbnail: normalizeText(formData.thumbnail),
      read_time: normalizeText(formData.read_time) || '5 min read',
      tags: parseTags(formData.tags),
    };

    try {
      if (editingPost) {
        await userApi.updateBlog(editingPost.id, payload);
        toast.success('Post updated');
      } else {
        await userApi.createBlog(payload);
        toast.success('Post created');
      }
      await fetchPosts();
      closeForm();
    } catch (error) {
      const errors = error.response?.data;
      const message = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : 'Failed to save post';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await userApi.deleteBlog(id);
      toast.success('Post deleted');
      await fetchPosts();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Draft';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Draft' : parsed.toLocaleDateString();
  };

  return (
    <div className="admin-content-page">
      <div className="admin-page-header admin-content-page__header">
        <div>
          <h1>Blog Posts</h1>
          <p>Write, publish, and maintain your content library.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <FaPlus /> New Post
        </button>
      </div>

      <div className="admin-content-toolbar glass">
        <label className="admin-panel__search">
          <FaSearch />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search posts by title, excerpt or tag"
            aria-label="Search blog posts"
          />
        </label>
        <label className="admin-content-filter">
          <FaFilter />
          <select
            className="form-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter posts by status"
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
              <h2>{editingPost ? 'Edit Post' : 'Create Post'}</h2>
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
                    label="Read Time"
                    name="read_time"
                    value={formData.read_time}
                    onChange={handleChange}
                    hint="Example: 6 min read"
                  />
                </div>

                <FormField
                  label="Excerpt"
                  name="excerpt"
                  type="textarea"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  maxLength={320}
                  hint={`${formData.excerpt.length}/320 characters`}
                  required
                />

                <FormField
                  label="Content"
                  name="content"
                  type="textarea"
                  value={formData.content}
                  onChange={handleChange}
                  rows={10}
                  hint={`${formData.content.length} characters`}
                  required
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
                    label="Tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="React, Django, API"
                    hint="Comma separated"
                  />
                </div>

                {formData.thumbnail && (
                  <div className="admin-media-preview">
                    <img src={formData.thumbnail} alt="Thumbnail preview" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  </div>
                )}

                <div className="admin-form__row">
                  <FormField
                    label="Published"
                    name="is_published"
                    type="checkbox"
                    value={formData.is_published}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Featured"
                    name="is_featured"
                    type="checkbox"
                    value={formData.is_featured}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={closeForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <LoadingSkeleton variant="text" count={7} />
      ) : sortedFilteredPosts.length === 0 ? (
        <div className="admin-panel__empty glass">
          <p>No posts match the current filter.</p>
        </div>
      ) : (
        <div className="admin-content-grid admin-content-grid--blog">
          {sortedFilteredPosts.map((post, index) => (
            <Motion.article
              key={post.id}
              className="admin-content-card glass"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="admin-content-card__media">
                {post.thumbnail ? (
                  <img src={post.thumbnail} alt={post.title} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="admin-content-card__placeholder">No Image</div>
                )}
              </div>
              <div className="admin-content-card__body">
                <div className="admin-content-card__chips">
                  <span className={`chip ${post.is_published ? 'chip-status-active' : 'chip-status-inactive'}`}>
                    {post.is_published ? <FaEye /> : <FaEyeSlash />}
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                  {post.is_featured && (
                    <span className="chip chip-status-admin">
                      <FaStar /> Featured
                    </span>
                  )}
                </div>
                <h3>{post.title}</h3>
                <div className="admin-content-card__meta">
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                  <span><FaClock /> {post.read_time || '5 min read'}</span>
                </div>
                <p className="admin-content-card__excerpt">{post.excerpt || 'No excerpt available.'}</p>
                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="admin-content-card__tags">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="chip">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="admin-content-card__actions">
                  <button type="button" className="admin-btn admin-btn--edit" onClick={() => openEdit(post)}>
                    <FaEdit /> Edit
                  </button>
                  <button type="button" className="admin-btn admin-btn--delete" onClick={() => handleDelete(post.id)}>
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
