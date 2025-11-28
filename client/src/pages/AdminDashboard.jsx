import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAllUsers, refillToken, deleteUser } from '../services/api';
import toast from 'react-hot-toast';
import { Users, MessageSquare, Activity, Trash2, Zap, LogOut, Shield } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalChats: 0, totalMessages: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const statsRes = await getAdminStats();
            const usersRes = await getAllUsers();
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            toast.error("Gagal memuat data admin");
            // Kalau bukan admin, tendang balik
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleRefill = async (id, currentTokens) => {
        const amount = prompt("Mau set token jadi berapa?", "300");
        if (!amount) return;
        
        try {
            await refillToken(id, amount);
            toast.success("Token berhasil diisi!");
            fetchData(); // Refresh data
        } catch (error) {
            toast.error("Gagal isi token");
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Yakin mau musnahkan user ${username}?`)) return;
        
        try {
            await deleteUser(id);
            toast.success(`${username} telah dimusnahkan.`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal hapus user");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-white">Loading Admin Data...</div>;

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-6 font-sans">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/20 rounded-lg">
                        <Shield className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">God Mode Dashboard</h1>
                        <p className="text-gray-400 text-xs">MengAi Administration</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition">
                        Ke Chat App
                    </button>
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-2 transition">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#18181b] p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400"><Users size={24} /></div>
                    <div>
                        <p className="text-gray-400 text-sm">Total User</p>
                        <h2 className="text-3xl font-bold">{stats.totalUsers}</h2>
                    </div>
                </div>
                <div className="bg-[#18181b] p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400"><MessageSquare size={24} /></div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Percakapan</p>
                        <h2 className="text-3xl font-bold">{stats.totalChats}</h2>
                    </div>
                </div>
                <div className="bg-[#18181b] p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 bg-green-600/20 rounded-xl text-green-400"><Activity size={24} /></div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Pesan</p>
                        <h2 className="text-3xl font-bold">{stats.totalMessages}</h2>
                    </div>
                </div>
            </div>

            {/* User Table */}
            <div className="max-w-6xl mx-auto bg-[#18181b] rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Sisa Token</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-4 text-gray-500 font-mono">#{user.id}</td>
                                    <td className="px-6 py-4 font-bold">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-mono ${user.tokens < 50 ? 'text-red-400' : 'text-green-400'}`}>
                                            {user.tokens}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleRefill(user.id)}
                                            className="p-2 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded-lg transition"
                                            title="Isi Ulang Token"
                                        >
                                            <Zap size={16} />
                                        </button>
                                        {user.role !== 'ADMIN' && (
                                            <button 
                                                onClick={() => handleDelete(user.id, user.username)}
                                                className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition"
                                                title="Hapus User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;