import axios from 'axios';

// Base API client configured for the Django backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach JWT token ──────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle token refresh on 401 ──────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access_token', data.access);
          if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh);
          }

          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/admin/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Public API Methods ─────────────────────────────────────────────────────

export const publicApi = {
  getProfile: () => api.get('/profile/'),
  getProjects: (params = {}) => api.get('/projects/', { params }),
  getProjectBySlug: (slug) => api.get(`/projects/${slug}/`),
  getSkills: () => api.get('/skills/'),
  getSkillCategories: () => api.get('/skill-categories/'),
  getExperience: () => api.get('/experience/'),
  sendMessage: (data) => api.post('/contact/', data),
};

// ─── Admin API Methods ──────────────────────────────────────────────────────

export const adminApi = {
  // Auth
  login: (credentials) => api.post('/auth/token/', credentials),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),

  // Dashboard
  getDashboard: () => api.get('/admin/dashboard/'),

  // Profile
  getProfile: () => api.get('/admin/profile/'),
  updateProfile: (data) => api.put('/admin/profile/', data),

  // Projects
  getProjects: () => api.get('/admin/projects/'),
  createProject: (data) => api.post('/admin/projects/', data),
  updateProject: (id, data) => api.put(`/admin/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/admin/projects/${id}/`),

  // Skills
  getSkills: () => api.get('/admin/skills/'),
  createSkill: (data) => api.post('/admin/skills/', data),
  updateSkill: (id, data) => api.put(`/admin/skills/${id}/`, data),
  deleteSkill: (id) => api.delete(`/admin/skills/${id}/`),

  // Skill Categories
  getCategories: () => api.get('/admin/skill-categories/'),
  createCategory: (data) => api.post('/admin/skill-categories/', data),
  updateCategory: (id, data) => api.put(`/admin/skill-categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/admin/skill-categories/${id}/`),

  // Experience
  getExperience: () => api.get('/admin/experience/'),
  createExperience: (data) => api.post('/admin/experience/', data),
  updateExperience: (id, data) => api.put(`/admin/experience/${id}/`, data),
  deleteExperience: (id) => api.delete(`/admin/experience/${id}/`),

  // Messages
  getMessages: () => api.get('/admin/messages/'),
  updateMessage: (id, data) => api.patch(`/admin/messages/${id}/`, data),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}/`),

  // Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
