import axios from 'axios';

// Base API client configured for the Django backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';
const DEFAULT_PUBLIC_USERNAME = import.meta.env.VITE_DEFAULT_PUBLIC_USERNAME || 'demo';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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

const resolveUsername = (username) => {
  if (typeof username === 'string' && username.trim().length > 0) {
    return username.trim();
  }
  return DEFAULT_PUBLIC_USERNAME;
};

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const resolveUsernameAndParams = (usernameOrParams, maybeParams = {}) => {
  if (typeof usernameOrParams === 'string') {
    return { username: resolveUsername(usernameOrParams), params: maybeParams };
  }
  if (isPlainObject(usernameOrParams)) {
    return { username: DEFAULT_PUBLIC_USERNAME, params: usernameOrParams };
  }
  return { username: DEFAULT_PUBLIC_USERNAME, params: maybeParams };
};

export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (credentials) => api.post('/auth/token/', credentials),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
  me: () => api.get('/auth/me/'),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

export const publicApi = {
  getProfile: (username) => api.get(`/u/${resolveUsername(username)}/profile/`),
  getProjects: (usernameOrParams, maybeParams = {}) => {
    const { username, params } = resolveUsernameAndParams(usernameOrParams, maybeParams);
    return api.get(`/u/${username}/projects/`, { params });
  },
  getProjectBySlug: (usernameOrSlug, maybeSlug) => {
    if (typeof maybeSlug === 'string') {
      return api.get(`/u/${resolveUsername(usernameOrSlug)}/projects/${maybeSlug}/`);
    }
    return api.get(`/u/${DEFAULT_PUBLIC_USERNAME}/projects/${usernameOrSlug}/`);
  },
  getSkills: (username) => api.get(`/u/${resolveUsername(username)}/skills/`),
  getExperience: (username) => api.get(`/u/${resolveUsername(username)}/experience/`),
  getEducation: (username) => api.get(`/u/${resolveUsername(username)}/education/`),
  getActivities: (username) => api.get(`/u/${resolveUsername(username)}/activities/`),
  getAchievements: (username) => api.get(`/u/${resolveUsername(username)}/achievements/`),
  getCertifications: (username) => api.get(`/u/${resolveUsername(username)}/certifications/`),
  getBlogs: (usernameOrParams, maybeParams = {}) => {
    const { username, params } = resolveUsernameAndParams(usernameOrParams, maybeParams);
    return api.get(`/u/${username}/blog/`, { params });
  },
  getBlogBySlug: (usernameOrSlug, maybeSlug) => {
    if (typeof maybeSlug === 'string') {
      return api.get(`/u/${resolveUsername(usernameOrSlug)}/blog/${maybeSlug}/`);
    }
    return api.get(`/u/${DEFAULT_PUBLIC_USERNAME}/blog/${usernameOrSlug}/`);
  },
  getTestimonials: (usernameOrParams, maybeParams = {}) => {
    const { username, params } = resolveUsernameAndParams(usernameOrParams, maybeParams);
    return api.get(`/u/${username}/testimonials/`, { params });
  },
  sendMessage: (usernameOrData, maybeData) => {
    if (isPlainObject(usernameOrData) && maybeData === undefined) {
      return api.post(`/u/${DEFAULT_PUBLIC_USERNAME}/contact/`, usernameOrData);
    }
    return api.post(`/u/${resolveUsername(usernameOrData)}/contact/`, maybeData);
  },
};

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

  // Education
  getEducation: () => api.get('/user/education/'),
  createEducation: (data) => api.post('/user/education/', data),
  updateEducation: (id, data) => api.put(`/user/education/${id}/`, data),
  deleteEducation: (id) => api.delete(`/user/education/${id}/`),

  // Activities
  getActivities: () => api.get('/user/activities/'),
  createActivity: (data) => api.post('/user/activities/', data),
  updateActivity: (id, data) => api.put(`/user/activities/${id}/`, data),
  deleteActivity: (id) => api.delete(`/user/activities/${id}/`),

  // Achievements
  getAchievements: () => api.get('/user/achievements/'),
  createAchievement: (data) => api.post('/user/achievements/', data),
  updateAchievement: (id, data) => api.put(`/user/achievements/${id}/`, data),
  deleteAchievement: (id) => api.delete(`/user/achievements/${id}/`),

  // Certifications
  getCertifications: () => api.get('/user/certifications/'),
  createCertification: (data) => api.post('/user/certifications/', data),
  updateCertification: (id, data) => api.put(`/user/certifications/${id}/`, data),
  deleteCertification: (id) => api.delete(`/user/certifications/${id}/`),

  // Messages
  getMessages: () => api.get('/user/messages/'),
  updateMessage: (id, data) => api.patch(`/user/messages/${id}/`, data),
  deleteMessage: (id) => api.delete(`/user/messages/${id}/`),

  // Blog
  getBlogs: () => api.get('/user/blog/'),
  createBlog: (data) => api.post('/user/blog/', data),
  updateBlog: (id, data) => api.put(`/user/blog/${id}/`, data),
  deleteBlog: (id) => api.delete(`/user/blog/${id}/`),

  // Testimonials
  getTestimonials: () => api.get('/user/testimonials/'),
  createTestimonial: (data) => api.post('/user/testimonials/', data),
  updateTestimonial: (id, data) => api.put(`/user/testimonials/${id}/`, data),
  deleteTestimonial: (id) => api.delete(`/user/testimonials/${id}/`),

  // Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/user/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Backward compatibility aliases
export const dashboardApi = userApi;

export const adminApi = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: () => api.get('/admin/users/'),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  toggleUser: (id, isActive) => api.patch(`/admin/users/${id}/`, { is_active: isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  impersonateUser: (id) => api.post(`/admin/impersonate/${id}/`),
  stopImpersonation: (originalAdminId) =>
    api.post('/admin/stop-impersonation/', { original_admin_id: originalAdminId }),
};

// Backward compatibility alias
export const superAdminApi = adminApi;

export default api;
