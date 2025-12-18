import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';
import { Terminal } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(formData);
      
      // Simpan data token & user buat sesi
      localStorage.setItem('token', res.data.token); 
      localStorage.setItem('user', JSON.stringify(res.data.user)); 
      
      toast.success(`Welcome back, ${res.data.user.username}!`, {
        icon: '🚀',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      navigate('/chat'); // Redirect ke chat
    } catch (error) {
      toast.error(error.response?.data?.error || "Login gagal bro!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
            <Terminal size={32} color="white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-white mb-2">MengAi Access</h2>
        <p className="text-center text-gray-400 mb-8 text-sm">Masukin kredensial lu buat akses System.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input 
              type="text" 
              name="username"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#09090b] border border-white/10 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition placeholder-gray-600"
              placeholder="Ex: daffa_ganteng"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#09090b] border border-white/10 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition placeholder-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transform hover:-translate-y-1 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Decrypting Access...' : 'Login Sekarang'}
          </button>
        </form>

        {/* --- TAMBAHAN LINK LUPA PASSWORD --- */}
        <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-white transition decoration-dotted underline">
                Lupa Password?
            </Link>
        </div>
        {/* ---------------------------------- */}

        <p className="mt-6 text-center text-gray-400 text-sm">
          Belum punya akses?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
            Daftar Dulu Bro
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;