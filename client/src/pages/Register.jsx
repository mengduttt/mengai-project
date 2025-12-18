import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import toast from 'react-hot-toast';
import { Cpu } from 'lucide-react';

const Register = () => {
  // Tambahin 'email' di state awal
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(formData);
      toast.success('Akun berhasil dibuat! Silakan login.', {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal daftar bro!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
       <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
            <Cpu size={32} color="white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-white mb-2">Join MengAi</h2>
        <p className="text-center text-gray-400 mb-8 text-sm">Dapetin 300 Token gratis sekarang!</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input 
              type="text" 
              name="username"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#09090b] border border-white/10 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white transition placeholder-gray-600"
              placeholder="daffa_keren"
              required
            />
          </div>

          {/* === INI YANG BARU: INPUT EMAIL === */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Aktif</label>
            <input 
              type="email" 
              name="email"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#09090b] border border-white/10 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white transition placeholder-gray-600"
              placeholder="biar_bisa_reset_password@gmail.com"
              required
            />
          </div>
          {/* ================================= */}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#09090b] border border-white/10 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white transition placeholder-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg transform hover:-translate-y-1 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating User...' : 'Buat Akun'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Udah punya akun?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline">
            Login Sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;