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

// ─── User Dashboard API (authenticated user's own data) ──────────────────────────

export const userApi = {
  // Stats
  getStats: () => api.get('/user/stats/'),

  // Profile
  getProfile: () => api.get('/user/profile/'),
  updateProfile: (data) => api.put('/user/profile/', data),

  // Projects
  getProjects: () => api.get('/user/projects/'),
  createProject: (data) => api.post('/user/projects/', data),
  updateProject: (id, data) => api.put(`/user/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/user/projects/${id}/`),

  // Skills
  getSkills: () => api.get('/user/skills/'),
  createSkill: (data) => api.post('/user/skills/', data),
  updateSkill: (id, data) => api.put(`/user/skills/${id}/`, data),
  deleteSkill: (id) => api.delete(`/user/skills/${id}/`),

  // Skill Categories
  getCategories: () => api.get('/user/skill-categories/'),
  createCategory: (data) => api.post('/user/skill-categories/', data),
  updateCategory: (id, data) => api.put(`/user/skill-categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/user/skill-categories/${id}/`),

  // Experience
  getExperience: () => api.get('/user/experience/'),
  createExperience: (data) => api.post('/user/experience/', data),
  updateExperience: (id, data) => api.put(`/user/experience/${id}/`, data),
  deleteExperience: (id) => api.delete(`/user/experience/${id}/`),

  // Messages
  getMessages: () => api.get('/user/messages/'),
  updateMessage: (id, data) => api.patch(`/user/messages/${id}/`, data),
  deleteMessage: (id) => api.delete(`/user/messages/${id}/`),

  // Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/user/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Backward compatibility aliases ───────────────────────────────────────────
export const dashboardApi = userApi;

// ─── Admin API (platform owner only) ──────────────────────────────────

export const adminApi = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: () => api.get('/admin/users/'),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  toggleUser: (id, isActive) => api.patch(`/admin/users/${id}/`, { is_active: isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  impersonateUser: (id) => api.post(`/admin/impersonate/${id}/`),
  stopImpersonation: (originalAdminId) => api.post('/admin/stop-impersonation/', { original_admin_id: originalAdminId }),
};

// ─── Backward compatibility alias ───────────────────────────────────────────
export const superAdminApi = adminApi;

export default api;
