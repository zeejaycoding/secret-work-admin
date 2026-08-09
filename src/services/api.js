import axios from "axios";

const API_URL = "https://secret-work-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin-token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export const adminLogin = (email, password) =>
  api.post("/admin/login", { email, password });

export const adminForgotPassword = (email) =>
  api.post("/admin/forgot-password", { email });

export const adminResetPassword = (email, currentPassword, newPassword) =>
  api.post("/admin/reset-password", { email, currentPassword, newPassword });

export const adminForgotPasswordReset = (newPassword) =>
  api.post("/admin/forgot-password-reset", { newPassword });

export const getDashboardStats = () => api.get("/admin/dashboard");

export const getDrills = (params) => api.get("/admin/drills", { params });

export const getDrill = (id) => api.get(`/admin/drills/${id}`);

export const createDrill = (data) =>
  api.post("/admin/drills", data, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
  });

export const updateDrill = (id, data) =>
  api.put(`/admin/drills/${id}`, data, {
    timeout: 180000,
  });

export const updateDrillFiles = (id, formData) =>
  api.put(`/admin/drills/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
  });

export const deleteDrill = (id) => api.delete(`/admin/drills/${id}`);

export const getUsers = (params) => api.get("/admin/users", { params });

export const getSubscriptions = (params) =>
  api.get("/admin/subscriptions", { params });

export const getPlanDetail = (key) => api.get(`/admin/plans/${key}`);

export const getAnalytics = () => api.get("/admin/analytics");

export const updatePlan = (key, data) => api.put(`/admin/plans/${key}`, data);

export const getUser = (id) => api.get(`/admin/users/${id}`);

export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);

export const resetUserPassword = (id) =>
  api.post(`/admin/users/${id}/reset-password`);

export const getCategories = () => api.get("/admin/categories");

export const createCategory = (data) => api.post("/admin/categories", data);

export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

export const getPrograms = (params) => api.get("/admin/programs", { params });

export const getProgram = (id) => api.get(`/admin/programs/${id}`);

export const createProgram = (data) => api.post("/admin/programs", data);

export const updateProgram = (id, data) => api.put(`/admin/programs/${id}`, data);

export const removeDrillFromProgram = (id, drillId) =>
  api.delete(`/admin/programs/${id}/drills/${drillId}`);

export const deleteProgram = (id) => api.delete(`/admin/programs/${id}`);

export const getPros = (params) => api.get("/admin/pros", { params });

export const getPro = (id) => api.get(`/admin/pros/${id}`);

export const createPro = (data) =>
  api.post("/admin/pros", data, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
  });

export const updatePro = (id, data) => api.put(`/admin/pros/${id}`, data);

export const updateProFiles = (id, formData) =>
  api.put(`/admin/pros/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
  });

export const deletePro = (id) => api.delete(`/admin/pros/${id}`);

export const getPodcasts = () => api.get("/admin/podcasts");

export const getPodcast = (id) => api.get(`/admin/podcasts/${id}`);

export const createPodcast = (data) =>
  api.post("/admin/podcasts", data, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
  });

export const updatePodcast = (id, data) =>
  api.put(`/admin/podcasts/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
  });

export const deletePodcast = (id) => api.delete(`/admin/podcasts/${id}`);

export const transcribePodcast = (id) =>
  api.post(`/admin/podcasts/${id}/transcribe`, null, {
    timeout: 180000,
  });

export const getNotifications = () => api.get("/admin/notifications");

export const getRoles = () => api.get("/admin/roles");

export const getRole = (key) => api.get(`/admin/roles/${key}`);

export const updateRole = (key, data) => api.put(`/admin/roles/${key}`, data);

export const createRole = (data) => api.post("/admin/roles", data);

export const removeRoleUser = (key, userId) =>
  api.delete(`/admin/roles/${key}/users/${userId}`);

export const createNotification = (data) =>
  api.post("/admin/notifications", data);

export const sendNotification = (id) =>
  api.post(`/admin/notifications/${id}/send`);

export const deleteNotification = (id) =>
  api.delete(`/admin/notifications/${id}`);

export const getSettings = () => api.get("/admin/settings");

export const updateSettings = (data) => api.put("/admin/settings", data);

export default api;
