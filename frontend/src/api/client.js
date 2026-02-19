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
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (credentials) => api.post('/auth/token/', credentials),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
  me: () => api.get('/auth/me/'),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// ─── Public API (by username) ───────────────────────────────────────────────

export const publicApi = {
  getProfile: (username) => api.get(`/u/${username}/profile/`),
  getProjects: (username, params = {}) => api.get(`/u/${username}/projects/`, { params }),
  getProjectBySlug: (username, slug) => api.get(`/u/${username}/projects/${slug}/`),
  getSkills: (username) => api.get(`/u/${username}/skills/`),
  getExperience: (username) => api.get(`/u/${username}/experience/`),
  sendMessage: (username, data) => api.post(`/u/${username}/contact/`, data),
};

// ─── Dashboard API (authenticated user's own data) ──────────────────────────

export const dashboardApi = {
  // Stats
  getStats: () => api.get('/dashboard/stats/'),

  // Profile
  getProfile: () => api.get('/dashboard/profile/'),
  updateProfile: (data) => api.put('/dashboard/profile/', data),

  // Projects
  getProjects: () => api.get('/dashboard/projects/'),
  createProject: (data) => api.post('/dashboard/projects/', data),
  updateProject: (id, data) => api.put(`/dashboard/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/dashboard/projects/${id}/`),

  // Skills
  getSkills: () => api.get('/dashboard/skills/'),
  createSkill: (data) => api.post('/dashboard/skills/', data),
  updateSkill: (id, data) => api.put(`/dashboard/skills/${id}/`, data),
  deleteSkill: (id) => api.delete(`/dashboard/skills/${id}/`),

  // Skill Categories
  getCategories: () => api.get('/dashboard/skill-categories/'),
  createCategory: (data) => api.post('/dashboard/skill-categories/', data),
  updateCategory: (id, data) => api.put(`/dashboard/skill-categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/dashboard/skill-categories/${id}/`),

  // Experience
  getExperience: () => api.get('/dashboard/experience/'),
  createExperience: (data) => api.post('/dashboard/experience/', data),
  updateExperience: (id, data) => api.put(`/dashboard/experience/${id}/`, data),
  deleteExperience: (id) => api.delete(`/dashboard/experience/${id}/`),

  // Messages
  getMessages: () => api.get('/dashboard/messages/'),
  updateMessage: (id, data) => api.patch(`/dashboard/messages/${id}/`, data),
  deleteMessage: (id) => api.delete(`/dashboard/messages/${id}/`),

  // Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/dashboard/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Backward compatibility alias ───────────────────────────────────────────
export const adminApi = dashboardApi;

export default api;
