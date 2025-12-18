import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Menu, Plus, Trash2, MessageSquare, Sparkles, User, Cpu, X, Mic, StopCircle, Volume2, FileText, Paperclip, FileAudio, LogOut, Shield, Settings as SettingsIcon, RefreshCw, Key, ThumbsUp, ThumbsDown, Lightbulb, Flame, Copy, Check, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useReactMediaRecorder } from "react-media-recorder";
import { sendMessage, getHistory, deleteChat, getProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';
import CodeCanvas from '../components/CodeCanvas';
import TypingEffect from '../components/TypingEffect';
import ThemeToggle from '../components/ThemeToggle';
import Tooltip from '../components/Tooltip';
import { SkeletonHistory, SkeletonMessage } from '../components/Skeleton';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// === CONFIG MARKDOWN ===
const renderComponents = {
    pre: ({ node, ...props }) => <div className="not-prose my-4 w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl" {...props} />,
    code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        return !inline && match ? (
            <CodeCanvas language={match[1]} code={String(children).replace(/\n$/, '')} />
        ) : (
            <code className="bg-[#2d2d2d]/80 text-pink-300 px-1.5 py-0.5 rounded border border-white/10 font-mono text-sm break-all" {...props}>{children}</code>
        )
    },
    ul: (props) => <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-300" {...props} />,
    ol: (props) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-300" {...props} />,
    h1: (props) => <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-6 mb-4 border-b border-white/10 pb-2" {...props} />,
    h2: (props) => <h2 className="text-xl font-bold text-blue-300 mt-5 mb-3" {...props} />,
    p: (props) => <p className="mb-3 leading-7 text-gray-300 text-[15px]" {...props} />,
    a: (props) => <a className="text-blue-400 hover:text-blue-300 hover:underline transition-colors" target="_blank" {...props} />,
    strong: (props) => <strong className="text-white font-bold" {...props} />,
    blockquote: (props) => <blockquote className="border-l-4 border-blue-500/50 pl-4 py-2 my-4 bg-white/5 rounded-r-lg italic text-gray-400" {...props} />,
};

// === CHAT INPUT ===
const ChatInput = ({ onSend, loading, isMobile = false }) => {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'id-ID';
            recognition.interimResults = false;
            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setInput((prev) => (prev ? prev + " " + text : text));
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) { toast.error("Browser ga support voice"); return; }
        if (isListening) recognitionRef.current.stop();
        else { recognitionRef.current.start(); setIsListening(true); toast("Mendengarkan...", { icon: '🎤', style: { borderRadius: '10px', background: 'rgba(0,0,0,0.8)', color: '#fff', backdropFilter: 'blur(10px)' } }); }
    };

    const handleSendClick = () => {
        if (!input.trim() && !selectedFile) return;
        onSend(input, selectedFile);
        setInput(''); setSelectedFile(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    };

    const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });

    useEffect(() => {
        if (mediaBlobUrl && status === 'stopped') {
            const sendAudio = async () => {
                const blob = await fetch(mediaBlobUrl).then(r => r.blob());
                const audioFile = new File([blob], "voice_note.wav", { type: "audio/wav" });
                onSend("", audioFile);
                toast.success("Voice Note terkirim!");
            };
            sendAudio();
        }
    }, [mediaBlobUrl, status]);

    return (
        <div className="p-3 sm:p-4 md:p-6 bg-black/20 backdrop-blur-xl border-t border-white/10 z-20">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-4xl mx-auto bg-white/5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2 relative ring-1 ring-white/5 focus-within:ring-blue-500/50 transition-all duration-300"
            >
                {selectedFile && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/10 px-3 py-2 rounded-xl border border-white/5 flex items-center justify-between text-xs text-blue-300 mb-1">
                        <span className="truncate max-w-[200px] flex items-center gap-2"><FileText size={14}/> {selectedFile.name}</span>
                        <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white bg-white/10 rounded-full p-1"><X size={12}/></button>
                    </motion.div>
                )}
                <div className="flex items-end gap-3">
                    <label className={`p-2 sm:p-2.5 text-gray-400 rounded-xl transition-all touch-manipulation ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-400 cursor-pointer hover:bg-white/10'
                    }`}>
                        <Paperclip size={20} />
                        <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} accept="image/*,.pdf,.txt,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={loading} />
                    </label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            loading ? "🤖 AI is thinking..." : 
                            status === 'recording' ? "Recording..." : 
                            (isMobile ? "Message..." : "Type message for MengAi...")
                        }
                        className={`flex-1 bg-transparent outline-none text-white resize-none py-2.5 text-sm max-h-32 font-medium transition-all ${
                            loading ? 'opacity-50 cursor-not-allowed placeholder-blue-400' : 'placeholder-gray-500'
                        }`}
                        rows={1}
                        disabled={status === 'recording' || loading}
                    />
                    <div className="flex items-center gap-1">
                         <button
                            onClick={status === 'recording' ? stopRecording : startRecording}
                            disabled={loading}
                            className={`p-2.5 rounded-xl transition-all duration-300 ${
                                loading ? 'opacity-50 cursor-not-allowed' :
                                status === 'recording' ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50 shadow-red-500/20 shadow-lg' : 
                                'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {status === 'recording' ? <StopCircle size={20} /> : <Mic size={20} />}
                        </button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendClick} 
                            disabled={loading || status === 'recording'} 
                            className="p-2 sm:p-2.5 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl text-white disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/20 transition-all min-w-[40px] sm:min-w-0 touch-manipulation"
                        >
                            <Send size={18} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// === MAIN INTERFACE ===
const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [history, setHistory] = useState([]);
    const [mode, setMode] = useState('general');
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const [tokens, setTokens] = useState(300);
    const [currentConvId, setCurrentConvId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [user, setUser] = useState(null);

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedMsgId, setCopiedMsgId] = useState(null);

    // === COPY TO CLIPBOARD FUNCTION ===
    const copyToClipboard = async (text, msgId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMsgId(msgId);
            toast.success('Copied!', { icon: '📋', duration: 1500 });
            setTimeout(() => setCopiedMsgId(null), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    // LARGE POOL OF QUICK PROMPTS (akan di-random)
    const allQuickPrompts = [
        // Coding & Tech
        { icon: "💻", text: "Buatin kodingan login React dengan JWT", category: "coding" },
        { icon: "🎨", text: "Buatin gambar naga cyberpunk", category: "image" },
        { icon: "🔧", text: "Cara optimize React app performance", category: "coding" },
        { icon: "🚀", text: "Explain microservices architecture simply", category: "coding" },
        { icon: "🐛", text: "Debug kenapa API ku 500 error terus", category: "coding" },
        
        // Creative & Design
        { icon: "✨", text: "Ide nama startup yang catchy", category: "creative" },
        { icon: "🎭", text: "Buatin script video TikTok viral", category: "creative" },
        { icon: "📝", text: "Tulis caption Instagram aesthetic", category: "creative" },
        { icon: "🎬", text: "Konsep video marketing produk SaaS", category: "creative" },
        
        // Business & Career
        { icon: "💡", text: "Ide bisnis modal 1 juta", category: "business" },
        { icon: "📊", text: "Strategi marketing untuk startup", category: "business" },
        { icon: "💼", text: "Tips interview kerja biar diterima", category: "business" },
        { icon: "🎯", text: "Cara scale business dari 0 to 1M", category: "business" },
        
        // Personal & Lifestyle
        { icon: "💖", text: "Cara nembak cewe biar diterima", category: "personal" },
        { icon: "🏋️", text: "Bikin workout plan 30 hari", category: "personal" },
        { icon: "🧠", text: "Cara produktif tanpa burnout", category: "personal" },
        { icon: "😴", text: "Tips tidur berkualitas", category: "personal" },
        
        // Education & Learning
        { icon: "🎓", text: "Buatin kerangka skripsi tentang AI", category: "education" },
        { icon: "📚", text: "Explain quantum computing for dummies", category: "education" },
        { icon: "🔬", text: "Jelaskan machine learning secara simple", category: "education" },
        { icon: "🌍", text: "Dampak climate change ke ekonomi", category: "education" },
        
        // Fun & Random
        { icon: "🎮", text: "Rekomendasi game indie terbaik 2024", category: "fun" },
        { icon: "🍕", text: "Resep pizza homemade yang gampang", category: "fun" },
        { icon: "🎵", text: "Playlist lo-fi untuk coding", category: "fun" },
        { icon: "🌌", text: "Fun facts tentang black hole", category: "fun" },
        { icon: "🤖", text: "Prediksi teknologi 10 tahun lagi", category: "tech" },
    ];

    // Random selection saat component mount
    const [quickPrompts, setQuickPrompts] = useState([]);
    
    useEffect(() => {
        // Shuffle and pick 4 random prompts
        const shuffled = [...allQuickPrompts].sort(() => Math.random() - 0.5);
        setQuickPrompts(shuffled.slice(0, 4));
    }, []); // Empty dependency = only run once on mount


    useEffect(() => {
        const syncUserData = async () => {
            try {
                const res = await getProfile();
                setUser(res.data); // FIX: Set user dari API
                setTokens(res.data.tokens);
                // Update localStorage to always have latest data
                localStorage.setItem('user', JSON.stringify(res.data));
            } catch (err) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) setUser(JSON.parse(storedUser));
            }
        };
        syncUserData();
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await getHistory();
            setHistory(res.data.conversations);  // Backend sends {conversations: [...]}
        } catch (err) { console.error(err); }
    };

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile && !sidebarOpen) setSidebarOpen(true);
            if (mobile && sidebarOpen) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        if (window.confirm("Yakin mau logout?")) {
            localStorage.clear();
            navigate('/login');
        }
    };

    const handleDeleteChat = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Hapus chat ini?")) return;
        try {
            await deleteChat(id);
            toast.success("Dihapus!", { icon: '🗑️' });
            loadHistory();
            if (currentConvId === id) { setMessages([]); setCurrentConvId(null); }
        } catch (error) { toast.error("Gagal hapus"); }
    };

    const speakMessage = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID'; utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        } else { toast.error("Browser ga support suara"); }
    };

    const handleRegenerate = async () => {
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
        if (!lastUserMsg) return;
        const newMessages = messages.filter((m, i) => i !== messages.length - 1 || m.role !== 'model');
        setMessages(newMessages);
        handleSendMessage(lastUserMsg.content, null);
    };

    const handleSendMessage = async (text, file) => {
        let msgType = 'text';
        if (file) {
            if (file.type.includes('image')) msgType = 'image';
            else if (file.type.includes('audio')) msgType = 'audio';
            else msgType = 'document';
        }

        const userMsg = {
            role: 'user', content: text || (msgType === 'audio' ? "🎤 Voice Note" : ""),
            type: msgType, fileName: file ? file.name : null
        };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        const formData = new FormData();
        formData.append('prompt', text || ""); formData.append('mode', mode);
        if (currentConvId) formData.append('conversationId', currentConvId);
        if (file) formData.append('file', file);

        try {
            const res = await sendMessage(formData);
            let content = res.data.aiResponse;  // Backend sends 'aiResponse', not 'response'
            let type = res.data.messageType || 'text';

            const aiMsg = { role: 'model', content: content, type: type, isNew: true };
            setMessages(prev => [...prev, aiMsg]);

            // Backend doesn't send tokensLeft, we'll refresh from profile instead
            setCurrentConvId(res.data.conversationId);
            loadHistory();
        } catch (error) { toast.error("Gagal kirim"); }
        finally { setLoading(false); }
    };

    const handleReaction = (msgId, reaction) => {
        console.log(`Reacted to message ${msgId} with ${reaction}`);
        // In future: save to backend
    };

    return (
        <div className={`flex h-screen font-sans overflow-hidden relative ${
            theme === 'light' 
                ? 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900' 
                : 'bg-gradient-to-br from-[#0a0a0f] via-[#0f0f17] to-[#0a0a0f] text-gray-200'
        }`}>
            {/* Nothing */}

            {isMobile && sidebarOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />)}

            {/* SIDEBAR */}
            <motion.div 
                className={`h-full backdrop-blur-2xl border-r flex flex-col transition-all duration-300 ease-in-out ${
                    theme === 'light' 
                        ? 'bg-white/80 border-gray-200' 
                        : 'bg-black/40 border-white/5'
                } ${isMobile ? `fixed top-0 left-0 z-50 w-72 sm:w-80 shadow-2xl` : `relative z-20 ${sidebarOpen ? 'w-72 lg:w-80' : 'w-0 overflow-hidden'}`}`}
                animate={{ x: isMobile && !sidebarOpen ? -320 : 0, width: !isMobile && !sidebarOpen ? 0 : isMobile ? 288 : sidebarOpen ? 320 : 0 }}
            >
                <div className={`p-5 border-b flex justify-between items-center ${
                    theme === 'light' ? 'border-gray-200' : 'border-white/5'
                }`}>
                    <h1 className="font-extrabold text-xl animated-gradient-text flex items-center gap-2 tracking-tight">
                        <Sparkles size={20} className="text-blue-400 fill-blue-400/20 animate-float" /> MengAi
                    </h1>
                    <div className="flex gap-2">
                        <Tooltip content="New Chat">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setMessages([]); setCurrentConvId(null); if (isMobile) setSidebarOpen(false); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 border border-white/5 transition icon-btn-premium"><Plus size={18} /></motion.button>
                        </Tooltip>
                        {isMobile && (
                            <Tooltip content="Close">
                                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-full icon-btn-premium"><X size={18} /></button>
                            </Tooltip>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {/* Search Box */}
                    <div className="relative mb-3 input-glow rounded-lg">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chats..."
                            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className={`text-xs font-bold mb-2 px-2 uppercase tracking-wider ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-500'
                    }`}>History</div>
                    <AnimatePresence>
                        {Array.isArray(history) && history
                            .filter(chat => !searchQuery || chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(chat => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                key={chat.id} 
                                onClick={() => { setMessages(chat.messages); setCurrentConvId(chat.id); if (isMobile) setSidebarOpen(false); }} 
                                className={`group relative p-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${currentConvId === chat.id ? 'bg-gradient-to-r from-blue-500/10 to-transparent border-blue-500/30 text-blue-100' : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                            >
                                <MessageSquare size={16} className={`flex-shrink-0 ${currentConvId === chat.id ? 'text-blue-400' : 'text-gray-600'}`} />
                                <span className="text-sm truncate flex-1 pr-6 font-medium">{chat.title}</span>
                                <button onClick={(e) => handleDeleteChat(e, chat.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg absolute right-2 transition-all"><Trash2 size={14} /></button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {history.length === 0 && <div className="text-center text-gray-600 text-sm py-4 italic">Belum ada history chat</div>}
                    {history.length > 0 && searchQuery && history.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="text-center text-gray-600 text-sm py-4 italic">No results found</div>
                    )}
                </div>

                <div className={`p-4 border-t ${
                    theme === 'light' ? 'border-gray-200' : 'border-white/5'
                }`}>
                {/* AI TOKENS LEFT */}
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-white/5 backdrop-blur-sm">
                    <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                        <Cpu size={14}/> AI Tokens Left
                    </span>
                    <span className={`font-mono text-lg font-bold ${user?.role === 'ADMIN' ? 'text-yellow-400' : tokens < 50 ? 'text-red-400' : 'text-green-400'}`}>
                        {user?.role === 'ADMIN' ? '∞' : tokens}
                    </span>
                </motion.div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-purple-500/20">
                                {user?.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-bold text-gray-200 truncate">{user?.username || "Guest"}</span>
                                <div className="flex gap-2 items-center text-xs text-gray-500">
                                    {user?.role === 'ADMIN' ? <span className="text-yellow-500 flex items-center gap-1"><Shield size={10}/> Admin</span> : 'Free Plan'}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Tooltip content="Settings">
                                <button onClick={() => navigate('/settings')} className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition icon-btn-premium"><SettingsIcon size={16} /></button>
                            </Tooltip>
                            <Tooltip content="Logout">
                                <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition icon-btn-premium"><LogOut size={16} /></button>
                            </Tooltip>
                        </div>
                    </div>

                    {user?.role === 'ADMIN' && (
                        <button onClick={() => navigate('/admin')} className="mt-4 w-full py-2.5 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-300 flex items-center justify-center gap-2 transition hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50">
                            <Shield size={14} /> ADMIN DASHBOARD
                        </button>
                    )}
                </div>
            </motion.div>

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col relative min-w-0 w-full z-10">
                {/* HEADER */}
                <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/20 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Tooltip content={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all icon-btn-premium"><Menu size={20} /></button>
                        </Tooltip>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-bold text-white leading-tight">MengAI</h2>
                            <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Powered by Mengduttt</span>
                        </div>
                    </div>
                    
                    {/* AI MODE SELECTOR - PREMIUM */}
                    <div className="relative group pt-3">
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles size={12} className="text-purple-400" />
                            AI Personality
                        </label>
                        <div className="relative">
                            <select 
                                value={mode} 
                                onChange={(e) => setMode(e.target.value)}
                                className="w-full appearance-none bg-black/60 backdrop-blur-xl border-2 border-blue-500/50 rounded-xl px-4 py-3 pr-10 text-white font-semibold cursor-pointer 
                                hover:border-blue-400 hover:bg-black/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none 
                                transition-all duration-300 shadow-lg shadow-blue-500/10"
                                style={{
                                    backgroundImage: mode === 'general' ? 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(59,130,246,0.05))' :
                                                    mode === 'coding' ? 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(6,182,212,0.05))' :
                                                    mode === 'guru' ? 'linear-gradient(135deg, rgba(251,191,36,0.05), rgba(234,88,12,0.05))' :
                                                    mode === 'pacar' ? 'linear-gradient(135deg, rgba(236,72,153,0.05), rgba(219,39,119,0.05))' :
                                                    mode === 'motivator' ? 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(220,38,38,0.05))' :
                                                    mode === 'analisis' ? 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(37,99,235,0.05))' :
                                                    'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(59,130,246,0.05))'
                                }}
                            >
                                <option value="general">✨ General Mode</option>
                                <option value="coding">💻 Coding God</option>
                                <option value="guru">🎓 Guru Bijak</option>
                                <option value="pacar">💖 Virtual GF</option>
                                <option value="analisis">📊 Analyst Pro</option>
                                <option value="motivator">🔥 Motivator</option>
                            </select>
                            {/* Custom dropdown arrow */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MESSAGES LIST */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar smooth-scroll"
                     style={{
                         willChange: 'scroll-position',
                         transform: 'translateZ(0)',
                         backfaceVisibility: 'hidden',
                         perspective: 1000
                     }}
                     ref={messagesEndRef}>
                    <AnimatePresence initial={false}>
                        {messages?.length === 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="flex flex-col items-center justify-center h-full text-center px-4"
                            >
                                <div className="relative p-8 rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm max-w-2xl mx-auto shadow-2xl">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl rotate-3 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                                        <Sparkles size={40} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Hello, {user?.username || 'Human'}! 👋</h2>
                                    <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-md mx-auto">I'm MengAi, enhanced with Confidence I can generate images, write code, analyze data, and support your daily tasks with high precision.</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-left w-full">
                                        {quickPrompts.map((item, idx) => (
                                            <motion.button 
                                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                                key={idx} 
                                                onClick={() => !loading && handleSendMessage(item.text)} 
                                                disabled={loading}
                                                className={`p-3 sm:p-4 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl group transition-all touch-manipulation ${
                                                    loading ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 hover:border-blue-500/30'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xl bg-black/30 p-1.5 rounded-lg">{item.icon}</span>
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-400/10 px-2 py-0.5 rounded-full">{item.label}</span>
                                                </div>
                                                <div className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors pl-1">{item.text}</div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {(messages || []).map((msg, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                key={idx} 
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-5xl mx-auto group`}
                            >
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-tr from-blue-600 to-blue-500 rounded-tr-none' : 'bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-tl-none'}`}>
                                    {msg.role === 'user' ? <User size={16} className="text-white sm:w-[18px] sm:h-[18px]" /> : <Sparkles size={16} className="text-white sm:w-[18px] sm:h-[18px]" />}
                                </div>
                                
                                <div className={`relative px-4 sm:px-6 py-3 sm:py-4 shadow-xl overflow-hidden text-sm sm:text-[15px] leading-6 sm:leading-7 ${msg.role === 'user' ? 'bg-[#2563eb] text-white rounded-2xl sm:rounded-3xl rounded-tr-none max-w-[85%]' : 'bg-[#18181b]/80 backdrop-blur-md border border-white/10 text-gray-200 rounded-2xl sm:rounded-3xl rounded-tl-none w-full max-w-[90%] md:max-w-3xl'}`}>
                                    {/* MESSAGE ATTACHMENT BADGES */}
                                    {msg.type === 'image' && <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/20 text-xs font-bold text-gray-200 mb-3 border border-white/5"><ImageIcon size={12}/> Image Attached</div>}
                                    {msg.type === 'document' && <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/20 text-xs font-bold text-blue-100 mb-3 border border-blue-500/20"><FileText size={12}/> {msg.fileName || "Document Attached"}</div>}
                                    {msg.type === 'audio' && <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/20 text-xs font-bold text-green-100 mb-3 border border-green-500/20"><FileAudio size={12}/> Voice Note</div>}

                                    {/* MESSAGE CONTENT */}
                                    {msg.type === 'image_url' ? (
                                        <div className="rounded-xl overflow-hidden my-2 border border-white/10 shadow-lg relative group/img">
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-[10px] font-bold text-white border border-white/10">AI GENERATED</div>
                                            <img src={msg.content} alt="Generated by MengAi" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => window.open(msg.content, '_blank')} loading="lazy" />
                                        </div>
                                    ) : (
                                        msg.role === 'model' && msg.isNew ? 
                                            <TypingEffect text={msg.content} components={renderComponents} onComplete={() => { msg.isNew = false; }} /> : 
                                            msg.role === 'model' ? 
                                                <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#0c0c0e] prose-pre:border prose-pre:border-white/10 max-w-none w-full break-words">
                                                    <ReactMarkdown components={renderComponents}>{msg.content}</ReactMarkdown>
                                                </div> : 
                                                <div className="whitespace-pre-wrap break-words font-medium">{msg.content}</div>
                                    )}

                                    {/* ACTION BUTTONS AND REACTIONS */}
                                    {msg.role === 'model' && !msg.isNew && (
                                        <>
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/5">
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(msg.content, idx)} className={`p-1.5 hover:bg-white/10 rounded transition ${copiedMsgId === idx ? 'text-green-400' : 'text-gray-400 hover:text-white'}`} title="Copy">
                                                    {copiedMsgId === idx ? <Check size={12} /> : <Copy size={12} />}
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleRegenerate} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition" title="Regenerate"><RefreshCw size={12} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => speakMessage(msg.content)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition" title="Listen"><Volume2 size={12} /></motion.button>
                                            </div>
                                            <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex gap-1 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/5">
                                                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => { handleReaction(idx, 'helpful'); toast.success('👍', { duration: 1000 }); }} className="p-1 text-gray-400 hover:text-green-400 transition" title="Helpful"><ThumbsUp size={14} /></motion.button>
                                                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => { handleReaction(idx, 'not-helpful'); toast.error('👎', { duration: 1000 }); }} className="p-1 text-gray-400 hover:text-red-400 transition" title="Not Helpful"><ThumbsDown size={14} /></motion.button>
                                                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => { handleReaction(idx, 'insightful'); toast('💡', { duration: 1000 }); }} className="p-1 text-gray-400 hover:text-yellow-400 transition" title="Insightful"><Lightbulb size={14} /></motion.button>
                                                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => { handleReaction(idx, 'amazing'); toast('🔥', { duration: 1000 }); }} className="p-1 text-gray-400 hover:text-orange-400 transition" title="Amazing"><Flame size={14} /></motion.button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 pl-2">
                             <div className="flex gap-1">
                                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-purple-500 rounded-full"></motion.div>
                                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-pink-500 rounded-full"></motion.div>
                            </div>
                            <span className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold animate-pulse">MengAi is thinking...</span>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <ChatInput onSend={handleSendMessage} loading={loading} isMobile={isMobile} />
            </div>
        </div>
    );
};

export default ChatInterface;