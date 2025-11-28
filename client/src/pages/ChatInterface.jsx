import React, { useState, useEffect, useRef, memo } from 'react';
import { Send, Image as ImageIcon, Menu, Plus, Trash2, MessageSquare, Sparkles, User, Cpu, X, Mic, StopCircle, Volume2, FileText, Paperclip, FileAudio, LogOut, Shield, Settings as SettingsIcon, RefreshCw, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useReactMediaRecorder } from "react-media-recorder";
import { sendMessage, getHistory, deleteChat, getProfile } from '../services/api'; 
import { useNavigate } from 'react-router-dom';
import CodeCanvas from '../components/CodeCanvas';
import TypingEffect from '../components/TypingEffect';
import toast from 'react-hot-toast';

// === CONFIG MARKDOWN ===
const renderComponents = {
    pre: ({node, ...props}) => <div className="not-prose my-4 w-full overflow-hidden rounded-lg" {...props} />,
    code({node, inline, className, children, ...props}) {
        const match = /language-(\w+)/.exec(className || '')
        return !inline && match ? (
            <CodeCanvas language={match[1]} code={String(children).replace(/\n$/, '')} />
        ) : (
            <code className="bg-[#2d2d2d] text-pink-300 px-1 py-0.5 rounded border border-white/10 font-mono text-sm break-all" {...props}>{children}</code>
        )
    },
    ul: (props) => <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-300" {...props} />,
    ol: (props) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-300" {...props} />,
    h1: (props) => <h1 className="text-xl font-bold text-white mt-6 mb-3 border-b border-gray-700 pb-2" {...props} />,
    h2: (props) => <h2 className="text-lg font-bold text-blue-300 mt-5 mb-2" {...props} />,
    p: (props) => <p className="mb-3 leading-7 text-gray-300 text-[15px]" {...props} />,
    a: (props) => <a className="text-blue-400 hover:underline" target="_blank" {...props} />,
    strong: (props) => <strong className="text-white font-bold" {...props} />,
    blockquote: (props) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-white/5 rounded-r italic text-gray-400" {...props} />,
};

// === CHAT INPUT ===
const ChatInput = ({ onSend, loading }) => {
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
        else { recognitionRef.current.start(); setIsListening(true); toast("Mendengarkan...", { icon: '🎤', style: { borderRadius: '10px', background: '#333', color: '#fff' } }); }
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
        <div className="p-3 bg-[#09090b] border-t border-white/5">
            <div className="max-w-4xl mx-auto bg-[#18181b] p-2 rounded-xl border border-white/10 flex flex-col gap-2 relative">
                {selectedFile && (
                    <div className="bg-[#27272a] px-3 py-2 rounded-lg border border-white/10 flex items-center justify-between text-xs text-blue-300">
                        <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                        <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white">×</button>
                    </div>
                )}
                <div className="flex items-end gap-2">
                    <label className="p-2 text-gray-400 hover:text-white cursor-pointer hover:bg-white/5 rounded-lg">
                        <Paperclip size={20} />
                        <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} accept="image/*,.pdf,.txt" />
                    </label>
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={status === 'recording' ? "Merekam..." : "Ketik pesan..."}
                        className="flex-1 bg-transparent outline-none text-white resize-none py-2 text-sm max-h-32 placeholder-gray-500"
                        rows={1}
                        disabled={status === 'recording'}
                    />
                    <button 
                        onClick={status === 'recording' ? stopRecording : startRecording}
                        className={`p-2 rounded-lg transition ${status === 'recording' ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        {status === 'recording' ? <StopCircle size={20} /> : <Mic size={20} />}
                    </button>
                    <button onClick={handleSendClick} disabled={loading || status === 'recording'} className="p-2 bg-blue-600 rounded-lg text-white disabled:opacity-50 hover:bg-blue-500">
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// === 3. MAIN CHAT INTERFACE ===
const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [history, setHistory] = useState([]);
    const [mode, setMode] = useState('general');
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState(300);
    const [currentConvId, setCurrentConvId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [user, setUser] = useState(null);

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // QUICK PROMPTS
    const quickPrompts = [
        { icon: "🎨", text: "Buatin gambar naga cyberpunk" },
        { icon: "🎓", text: "Buatin kerangka skripsi tentang AI" },
        { icon: "💡", text: "Ide bisnis modal 1 juta" },
        { icon: "💖", text: "Cara nembak cewe biar diterima" }
    ];

    useEffect(() => {
        const syncUserData = async () => {
            try {
                const res = await getProfile();
                setUser(res.data);
                setTokens(res.data.tokens);
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
            setHistory(res.data);
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
        if(window.confirm("Yakin mau logout?")) {
            localStorage.clear();
            navigate('/login');
        }
    };

    const handleDeleteChat = async (e, id) => {
        e.stopPropagation();
        if(!window.confirm("Hapus chat ini?")) return;
        try {
            await deleteChat(id);
            toast.success("Dihapus!");
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
        if (file) formData.append('image', file);

        try {
            const res = await sendMessage(formData);
            
            // LOGIC NANGKEP IMAGE URL DARI BACKEND
            let content = res.data.response;
            let type = res.data.messageType || 'text'; // 'text' atau 'image_url'

            const aiMsg = { role: 'model', content: content, type: type, isNew: true };
            setMessages(prev => [...prev, aiMsg]);
            
            if(res.data.tokensLeft !== undefined) setTokens(res.data.tokensLeft);
            setCurrentConvId(res.data.conversationId);
            loadHistory(); 
        } catch (error) { toast.error("Gagal kirim"); } 
        finally { setLoading(false); }
    };

    return (
        <div className="flex h-screen bg-[#09090b] text-gray-200 font-sans overflow-hidden">
            {isMobile && sidebarOpen && ( <div className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} /> )}

            <div className={`h-full bg-[#0c0c0e] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out ${isMobile ? `fixed top-0 left-0 z-50 w-72 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` : `relative z-20 ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}`}>
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#111113]">
                    <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-2"><Sparkles size={18} className="text-blue-400" /> MengAi</h1>
                    <div className="flex gap-1">
                         <button onClick={() => { setMessages([]); setCurrentConvId(null); if(isMobile) setSidebarOpen(false); }} className="p-2 hover:bg-white/10 rounded-full"><Plus size={18} /></button>
                        {isMobile && <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full"><X size={18} /></button>}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {history.map(chat => (
                        <div key={chat.id} onClick={() => { setMessages(chat.messages); setCurrentConvId(chat.id); if(isMobile) setSidebarOpen(false); }} className={`group relative p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${currentConvId === chat.id ? 'bg-[#1f1f22] text-white border border-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                            <MessageSquare size={16} className={`flex-shrink-0 ${currentConvId === chat.id ? 'text-blue-400' : 'text-gray-600'}`} />
                            <span className="text-sm truncate flex-1 pr-6">{chat.title}</span>
                            <button onClick={(e) => handleDeleteChat(e, chat.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/50 text-gray-500 hover:text-red-400 rounded absolute right-1"><Trash2 size={14} /></button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/5 bg-[#0c0c0e]">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-2"><Cpu size={14} className="text-green-500" /> <span>Token</span></div>
                        <span className={`font-bold text-sm ${tokens < 50 ? 'text-red-400' : 'text-blue-400'}`}>{tokens}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                                {user?.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-bold text-gray-200 truncate">{user?.username || "Guest"}</span>
                                <div className="flex gap-2">
                                    {user?.role === 'ADMIN' && <Shield size={12} className="text-yellow-500" />}
                                    <button onClick={() => navigate('/settings')} title="Settings" className="hover:text-blue-400"><SettingsIcon size={12}/></button>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>

                    {user?.role === 'ADMIN' && (
                        <button onClick={() => navigate('/admin')} className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-bold text-blue-400 flex items-center justify-center gap-2 transition">
                            <Shield size={12} /> ADMIN PANEL
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col relative bg-[#09090b] min-w-0 w-full">
                <div className="h-16 border-b border-white/5 flex items-center px-4 justify-between bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg"><Menu size={20}/></button>
                        <span className="text-sm font-medium text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/5 hidden sm:block">{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</span>
                    </div>
                    <select value={mode} onChange={(e) => setMode(e.target.value)} className="bg-[#18181b] text-xs px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-blue-500 text-gray-300 max-w-[130px]">
                        <option value="general">✨ General</option>
                        <option value="coding">💻 Coding</option>
                        <option value="guru">📚 Guru</option>
                        <option value="pacar">💖 Pacar</option>
                        <option value="analisis">📊 Data</option>
                        <option value="motivator">🔥 Motivator</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6 opacity-100">
                            <div className="relative bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 shadow-2xl max-w-md mx-auto">
                                <Sparkles size={40} className="text-blue-400 mx-auto mb-3" />
                                <h2 className="text-xl font-bold text-white mb-2">Hai, {user?.username || 'Bro'}! 👋</h2>
                                <p className="text-gray-400 text-sm mb-6">Pilih topik obrolan biar ga bingung:</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                    {quickPrompts.map((item, idx) => (
                                        <button key={idx} onClick={() => handleSendMessage(item.text)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50 rounded-xl text-xs text-gray-300 transition flex items-center gap-3">
                                            <span className="text-lg">{item.icon}</span> {item.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-4xl mx-auto group`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>{msg.role === 'user' ? <User size={14} className="text-white" /> : <Sparkles size={14} className="text-white" />}</div>
                            <div className={`relative px-4 py-3 shadow-md overflow-hidden text-[14px] leading-relaxed ${msg.role === 'user' ? 'bg-[#2563eb] text-white rounded-2xl rounded-tr-none max-w-[85%]' : 'bg-[#18181b] border border-white/10 text-gray-200 rounded-2xl rounded-tl-none w-full max-w-[90%] md:max-w-3xl'}`}>
                                {msg.type === 'image' && <div className="text-xs text-gray-400 mb-2 flex items-center gap-1"><ImageIcon size={12}/> [Gambar]</div>}
                                {msg.type === 'document' && <div className="text-xs text-blue-300 mb-2 flex items-center gap-1"><FileText size={12}/> {msg.fileName || "[Dokumen]"}</div>}
                                {msg.type === 'audio' && <div className="text-xs text-green-400 mb-2 flex items-center gap-1"><FileAudio size={12}/> Voice Note</div>}
                                
                                {msg.type === 'image_url' ? (
                                    <div className="rounded-lg overflow-hidden my-2 border border-white/10">
                                        <img src={msg.content} alt="Generated by MengAi" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => window.open(msg.content, '_blank')} loading="lazy" />
                                        <p className="text-xs text-gray-500 p-2 bg-[#111113] italic">💡 Gambar dibuat oleh MengAi</p>
                                    </div>
                                ) : (
                                    msg.role === 'model' && msg.isNew ? <TypingEffect text={msg.content} components={renderComponents} onComplete={() => { msg.isNew = false; }} /> : msg.role === 'model' ? <div className="prose prose-invert max-w-none w-full break-words"><ReactMarkdown components={renderComponents}>{msg.content}</ReactMarkdown></div> : <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                                )}

                                {msg.role === 'model' && !msg.isNew && (
                                    <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={handleRegenerate} className="p-1.5 text-gray-500 hover:text-white" title="Regenerate"><RefreshCw size={12} /></button>
                                        <button onClick={() => speakMessage(msg.content)} className="p-1.5 text-gray-500 hover:text-white" title="Baca"><Volume2 size={12} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && <div className="text-xs text-gray-500 pl-12 animate-pulse">Sedang berpikir...</div>}
                    <div ref={messagesEndRef} />
                </div>
                <ChatInput onSend={handleSendMessage} loading={loading} />
            </div>
        </div>
    );
};

export default ChatInterface;