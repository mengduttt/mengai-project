import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginUser = (data) => api.post('/login', data);
export const registerUser = (data) => api.post('/register', data);
// FUNGSI BARU INI:
export const getProfile = () => api.get('/me'); 
export const updateProfile = (data) => api.put('/me', data);

export const sendMessage = (formData) => api.post('/chat', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getHistory = () => api.get('/history');
export const deleteChat = (id) => api.delete(`/conversation/${id}`);

// Admin API
export const getAdminStats = () => api.get('/admin/stats');
export const getAllUsers = () => api.get('/admin/users');
export const refillToken = (id, amount) => api.put(`/admin/users/${id}/token`, { amount });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// === FITUR LUPA PASSWORD (INI YANG BARU) ===
export const forgotPassword = (email) => api.post('/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post(`/reset-password/${token}`, { newPassword });

export default api;