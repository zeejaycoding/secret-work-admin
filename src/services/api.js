import axios from "axios";

const API_URL = "https://secret-work-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
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

export const adminLogout = () => {
  localStorage.removeItem("admin-token");
  try {
    window.location.href = "/";
  } catch {}
};

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
  api.post("/admin/drills", data, { timeout: 180000 });

export const updateDrill = (id, data) =>
  api.put(`/admin/drills/${id}`, data, {
    timeout: 180000,
  });

export const updateDrillFiles = (id, formData) =>
  api.put(`/admin/drills/${id}`, formData, { timeout: 180000 });

export const deleteDrill = (id) => api.delete(`/admin/drills/${id}`);

export const getCoach = (name) =>
  api.get(`/admin/coaches/${encodeURIComponent(name)}`);

export const deleteCoach = (name) =>
  api.delete(`/admin/coaches/${encodeURIComponent(name)}`);

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
  api.post("/admin/pros", data, { timeout: 180000 });

export const updatePro = (id, data) => api.put(`/admin/pros/${id}`, data);

export const updateProFiles = (id, formData) =>
  api.put(`/admin/pros/${id}`, formData, { timeout: 180000 });

export const deletePro = (id) => api.delete(`/admin/pros/${id}`);

export const getPodcasts = () => api.get("/admin/podcasts");

export const getPodcast = (id) => api.get(`/admin/podcasts/${id}`);

export const createPodcast = (data) =>
  api.post("/admin/podcasts", data, { timeout: 180000 });

export const updatePodcast = (id, data) =>
  api.put(`/admin/podcasts/${id}`, data, { timeout: 180000 });

export const deletePodcast = (id) => api.delete(`/admin/podcasts/${id}`);

export const transcribePodcast = (id) =>
  api.post(
    `/admin/podcasts/${id}/transcribe`,
    {},
    { timeout: 180000 }
  );

export const getNotifications = () => api.get("/admin/notifications");

export const getRoles = () => api.get("/admin/roles");

export const getRole = (key) => api.get(`/admin/roles/${key}`);

export const updateRole = (key, data) => api.put(`/admin/roles/${key}`, data);

export const createRole = (data) => api.post("/admin/roles", data);

export const removeRoleUser = (key, userId) =>
  api.delete(`/admin/roles/${key}/users/${userId}`);

export const createNotification = (data, config) =>
  api.post("/admin/notifications", data, config);

export const sendNotification = (id) =>
  api.post(`/admin/notifications/${id}/send`);

export const deleteNotification = (id) =>
  api.delete(`/admin/notifications/${id}`);

export const getSettings = () => api.get("/admin/settings");

export const getStorageUsage = () => api.get("/admin/settings/storage");

export const updateSettings = (data) => api.put("/admin/settings", data);

export const uploadBrandAsset = (file, type) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", type);
  return api.post("/admin/settings/upload", fd, { timeout: 120000 });
};

export default api;
