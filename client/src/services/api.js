import axios from 'axios';

// Use Vite env variable with fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token dari localStorage
const getToken = () => localStorage.getItem('token');

// Helper untuk header authorization
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// AUTH
export const register = (data) => axios.post(`${API_URL}/register`, data);
export const login = (data) => axios.post(`${API_URL}/login`, data);
export const getProfile = () => axios.get(`${API_URL}/me`, authHeader());
export const updateProfile = (data) => axios.put(`${API_URL}/me`, data, authHeader());

// Backward compatibility aliases
export const registerUser = register;
export const loginUser = login;

// CHAT
export const sendMessage = (formData) => axios.post(`${API_URL}/chat`, formData, authHeader());
export const sendMessageStream = (prompt, conversationId, mode) => {
    // Return EventSource for streaming
    const token = localStorage.getItem('token');
    const url = new URL(`${API_URL}/chat/stream`);
    
    // We can't use EventSource with POST body directly, so we'll use fetch with ReadableStream
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, conversationId, mode })
    });
};
export const getHistory = () => axios.get(`${API_URL}/history`, authHeader());
export const deleteChat = (id) => axios.delete(`${API_URL}/conversation/${id}`, authHeader());

// ADMIN
export const getDashboardStats = () => axios.get(`${API_URL}/admin/stats`, authHeader());
export const getAdminStats = getDashboardStats; // Alias for backward compatibility
export const getAllUsers = () => axios.get(`${API_URL}/admin/users`, authHeader());
export const refillToken = (userId, amount) => axios.put(`${API_URL}/admin/users/${userId}/token`, { amount }, authHeader());
export const deleteUser = (userId) => axios.delete(`${API_URL}/admin/users/${userId}`, authHeader());
export const promoteUser = (userId) => axios.post(`${API_URL}/admin/users/${userId}/promote`, {}, authHeader());
export const demoteUser = (userId) => axios.post(`${API_URL}/admin/users/${userId}/demote`, {}, authHeader());

// PASSWORD RESET
export const forgotPassword = (email) => axios.post(`${API_URL}/forgot-password`, { email });
export const resetPassword = (token, newPassword) => axios.post(`${API_URL}/reset-password/${token}`, { newPassword });

