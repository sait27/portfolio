import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { userApi } from '../../api/client';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    tags: [],
    read_time: '5 min read',
    is_published: false,
    is_featured: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await userApi.getBlogs();
      setPosts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(tag => tag.trim())
      };

      if (editingPost) {
        await userApi.updateBlog(editingPost.id, payload);
      } else {
        await userApi.createBlog(payload);
      }
      
      fetchPosts();
      resetForm();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await userApi.deleteBlog(id);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      thumbnail: '',
      tags: [],
      read_time: '5 min read',
      is_published: false,
      is_featured: false
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const startEdit = (post) => {
    setFormData({
      ...post,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags
    });
    setEditingPost(post);
    setShowForm(true);
  };

  if (loading) return <div className="loading">Loading blog posts...</div>;

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h2>Blog Posts</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <FaPlus /> Add Post
        </button>
      </div>

      {showForm && (
        <motion.div 
          className="admin-form-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="admin-form glass">
            <h3>{editingPost ? 'Edit Post' : 'Add New Post'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Excerpt *</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows="3"
                  placeholder="Brief summary of your blog post (150-200 characters recommended)"
                  maxLength="300"
                  required
                />
                <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>{formData.excerpt.length}/300 characters</small>
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="15"
                  placeholder="Write your blog content here... Supports markdown formatting."
                  required
                  style={{ fontFamily: 'monospace', fontSize: '14px' }}
                />
                <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>Tip: Use markdown for formatting (# for headings, ** for bold, etc.)</small>
              </div>

              <div className="form-group">
                <label>Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail && (
                  <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', maxWidth: '300px' }}>
                    <img src={formData.thumbnail} alt="Preview" style={{ width: '100%', display: 'block' }} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="React, Django, JavaScript"
                />
              </div>

              <div className="form-group">
                <label>Read Time</label>
                <input
                  type="text"
                  value={formData.read_time}
                  onChange={(e) => setFormData({...formData, read_time: e.target.value})}
                />
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                  />
                  Published
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  />
                  Featured
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPost ? 'Update' : 'Create'} Post
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <div className="admin-grid">
        {posts.map((post) => (
          <div key={post.id} className="admin-card glass">
            {post.thumbnail && (
              <img src={post.thumbnail} alt={post.title} className="admin-card__image" />
            )}
            <div className="admin-card__content">
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="admin-card__meta">
                <span className={`status ${post.is_published ? 'published' : 'draft'}`}>
                  {post.is_published ? <FaEye /> : <FaEyeSlash />}
                  {post.is_published ? 'Published' : 'Draft'}
                </span>
                {post.is_featured && <span className="featured">Featured</span>}
              </div>
              <div className="admin-card__actions">
                <button className="btn btn-sm btn-secondary" onClick={() => startEdit(post)}>
                  <FaEdit />
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(post.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="empty-state">
          <h3>No blog posts yet</h3>
          <p>Create your first blog post to get started.</p>
        </div>
      )}
    </div>
  );
}