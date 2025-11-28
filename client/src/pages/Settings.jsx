import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Lock, Save, Shield } from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: '', role: '' });
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            setUser(res.data);
            setNewUsername(res.data.username);
        } catch (err) {
            toast.error("Gagal ambil data user");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!newUsername.trim()) return toast.error("Username gaboleh kosong");
        
        setLoading(true);
        try {
            const payload = { username: newUsername };
            if (newPassword) payload.newPassword = newPassword;

            const res = await updateProfile(payload);
            
            // Update local storage biar sidebar langsung berubah
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            toast.success("Profil berhasil diupdate!");
            setNewPassword(''); // Reset field password
            setUser(res.data.user);
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal update");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-6 flex justify-center items-center relative overflow-hidden">
            {/* Background Blob */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-lg bg-[#18181b] border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
                    <ArrowLeft size={18} /> Kembali ke Chat
                </button>

                <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <User className="text-blue-500" /> Pengaturan Akun
                </h1>
                <p className="text-gray-500 text-sm mb-8">Update profil lu di sini, Bro.</p>

                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                    <Shield className="text-blue-400" />
                    <div>
                        <p className="text-xs text-blue-300 uppercase font-bold">Role Saat Ini</p>
                        <p className="text-sm font-bold text-white">{user.role}</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Username</label>
                        <div className="flex items-center bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
                            <User size={18} className="text-gray-500 mr-2" />
                            <input 
                                type="text" 
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="bg-transparent border-none outline-none text-white w-full text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Password Baru (Opsional)</label>
                        <div className="flex items-center bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
                            <Lock size={18} className="text-gray-500 mr-2" />
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Kosongin kalo gamau ganti"
                                className="bg-transparent border-none outline-none text-white w-full text-sm"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : <><Save size={18} /> Simpan Perubahan</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;