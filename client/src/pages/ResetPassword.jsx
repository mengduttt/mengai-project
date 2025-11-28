import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../services/api';
import toast from 'react-hot-toast';
import { Lock, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams(); // Ambil token dari URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      toast.success("Password berhasil direset! Login gih.", { duration: 4000 });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || "Token kadaluarsa atau salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative">
      <div className="w-full max-w-md p-8 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-green-600/20 rounded-xl">
            <Lock size={32} className="text-green-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-2">Password Baru</h2>
        <p className="text-center text-gray-400 mb-8 text-sm">Masukin password baru yang susah ditebak.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password Baru</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#09090b] border border-white/10 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-white transition"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;