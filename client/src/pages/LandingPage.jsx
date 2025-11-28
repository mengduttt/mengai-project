import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Shield, FileText, Mic, Code, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleGetStarted = () => {
        if (token) {
            navigate('/chat');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
            {/* Navbar Simple */}
            <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <Sparkles className="text-blue-500" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">MengAi</span>
                    </div>
                    <div className="flex gap-4">
                        {!token && (
                            <>
                                <button onClick={() => navigate('/login')} className="text-sm text-gray-400 hover:text-white transition">Masuk</button>
                                <button onClick={() => navigate('/register')} className="text-sm bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition">Daftar</button>
                            </>
                        )}
                        {token && (
                            <button onClick={() => navigate('/chat')} className="text-sm bg-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-500 transition">Buka App</button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 px-6">
                {/* Background Blobs */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] -z-10"></div>

                <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-blue-300 mb-4">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        AI Generasi Z Paling Update
                    </div>
                    
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
                        Asisten Pribadi <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                            Tanpa Batas.
                        </span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        MengAi bukan sekadar bot. Dia bisa dengerin curhat, bedah skripsi PDF, analisa kodingan, sampe ngasih saran percintaan. Gratis.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <button 
                            onClick={handleGetStarted}
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold text-lg shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Mulai Sekarang <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                        <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                            Pelajari Fitur
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard 
                        icon={<Mic className="text-green-400" />}
                        title="Voice Chat"
                        desc="Males ngetik? Ngomong aja. MengAi bisa dengerin dan bales pake suara."
                    />
                    <FeatureCard 
                        icon={<FileText className="text-yellow-400" />}
                        title="Bedah Dokumen"
                        desc="Upload PDF skripsi atau jurnal, MengAi bakal rangkum dan cariin jawabannya."
                    />
                    <FeatureCard 
                        icon={<Zap className="text-blue-400" />}
                        title="Real-Time Search"
                        desc="Data selalu update. Tanya harga Bitcoin atau berita hari ini, pasti akurat."
                    />
                    <FeatureCard 
                        icon={<Code className="text-purple-400" />}
                        title="Coding Master"
                        desc="Stuck ngoding? MengAi bisa debug, refactor, dan buatin script dari nol."
                    />
                    <FeatureCard 
                        icon={<Sparkles className="text-pink-400" />}
                        title="Multi Mode"
                        desc="Bisa jadi Guru, Pacar Virtual, Motivator, atau Data Analyst sesuai mood lu."
                    />
                    <FeatureCard 
                        icon={<Shield className="text-red-400" />}
                        title="Secure & Private"
                        desc="Chat lu aman. Kita pake enkripsi standar industri. Privasi nomor satu."
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-10 text-center text-gray-500 text-sm">
                <p>&copy; 2025 MengAi Project. Created by Daffa.</p>
            </footer>
        </div>
    );
};

// Komponen Kecil buat Kartu Fitur
const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-6 bg-[#18181b] border border-white/5 rounded-2xl hover:border-blue-500/30 hover:bg-white/5 transition-all group">
        <div className="mb-4 p-3 bg-white/5 w-fit rounded-xl group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;