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

export const getDashboardStats = () => api.get("/admin/dashboard");

export const getDrills = (params) => api.get("/admin/drills", { params });

export const getDrill = (id) => api.get(`/admin/drills/${id}`);

export const createDrill = (data) => api.post("/admin/drills", data);

export const updateDrill = (id, data) => api.put(`/admin/drills/${id}`, data);

export const deleteDrill = (id) => api.delete(`/admin/drills/${id}`);

export const getUsers = (params) => api.get("/admin/users", { params });

export default api;
