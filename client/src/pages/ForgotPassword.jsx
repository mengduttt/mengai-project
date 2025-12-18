import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';
import { KeyRound, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Isi email dulu bro");
    
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Link reset udah dikirim ke email lu!", { duration: 5000 });
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal kirim email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
       <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-600/20 rounded-xl">
            <KeyRound size={32} className="text-red-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-2">Lupa Password?</h2>
        <p className="text-center text-gray-400 mb-8 text-sm">Santai, masukin email lu di bawah. Kita kirim link resetnya.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Terdaftar</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#09090b] border border-white/10 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition placeholder-gray-600"
              placeholder="contoh@gmail.com"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 transition">
            <ArrowLeft size={14} /> Balik ke Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;