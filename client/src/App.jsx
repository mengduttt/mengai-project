import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// === IMPORT SEMUA HALAMAN ===
import ChatInterface from './pages/ChatInterface';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword'; // <--- PASTIIN FILE INI ADA
import ResetPassword from './pages/ResetPassword';   // <--- PASTIIN FILE INI ADA

// Komponen Proteksi (Cuma bisa diakses kalau udah login)
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
            {/* Halaman Depan (Public) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* === ROUTE LUPA PASSWORD (INI YANG BIKIN BLANK KALAU GAK ADA) === */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            {/* ================================================================ */}

            {/* Halaman Khusus Member (Private) */}
            <Route path="/admin" element={
                <PrivateRoute>
                    <AdminDashboard />
                </PrivateRoute>
            } />

            <Route path="/settings" element={
                <PrivateRoute>
                    <Settings />
                </PrivateRoute>
            } />

            <Route path="/chat" element={
                <PrivateRoute>
                    <ChatInterface />
                </PrivateRoute>
            } />
        </Routes>
    </Router>
  );
}

export default App;