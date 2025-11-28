import axios from "axios";

// Ambil dari env kalau ada (di Vercel/production),
// kalau nggak ada → fallback ke localhost (buat development).
// Pastikan VITE_API_URL *tanpa* slash di belakang, contoh:
// VITE_API_URL=https://namabackend.up.railway.app/api
const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Buang slash di belakang kalau ada (biar nggak jadi //login)
const API_URL = RAW_API_URL.replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_URL,
});

// Inject Authorization header kalau ada token di localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== AUTH ==========
export const loginUser = (data) => api.post("/login", data);
export const registerUser = (data) => api.post("/register", data);
export const getProfile = () => api.get("/me");
export const updateProfile = (data) => api.put("/me", data);

// ========== CHAT ==========
export const sendMessage = (formData) =>
  api.post("/chat", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getHistory = () => api.get("/history");
export const deleteChat = (id) => api.delete(`/conversation/${id}`);

// ========== ADMIN ==========
export const getAdminStats = () => api.get("/admin/stats");
export const getAllUsers = () => api.get("/admin/users");
export const refillToken = (id, amount) =>
  api.put(`/admin/users/${id}/token`, { amount });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// ========== PASSWORD RESET ==========
export const forgotPassword = (email) =>
  api.post("/forgot-password", { email });

export const resetPassword = (token, newPassword) =>
  api.post(`/reset-password/${token}`, { newPassword });

export default api;
