const { PrismaClient } = require('@prisma/client');
const { getGeminiResponse, summarizeChat } = require('../utils/gemini');
const fs = require('fs');
const pdfParse = require('pdf-parse'); 

const prisma = new PrismaClient();

// === 1. KIRIM PESAN (SEND MESSAGE) ===
exports.sendMessage = async (req, res) => {
    try {
        const { prompt, conversationId, mode } = req.body;
        const userId = req.user.id;
        const file = req.file; 

        // 1. Validasi Token
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        if (user.role !== 'ADMIN' && user.tokens <= 0) {
             return res.status(429).json({ error: "Token habis! Tunggu reset atau hubungi admin." });
        }

        if (user.role !== 'ADMIN') {
            await prisma.user.update({
                where: { id: userId },
                data: { tokens: user.tokens - 1 }
            });
        }

        // 2. Handle Conversation & Memory
        let convId = conversationId;
        let currentSummary = "";

        if (!convId || convId === 'null') {
            const newConv = await prisma.conversation.create({
                data: {
                    title: prompt ? prompt.substring(0, 30) + "..." : "Media Chat",
                    userId: userId
                }
            });
            convId = newConv.id;
        } else {
            // Ambil summary lama
            const existingConv = await prisma.conversation.findUnique({ where: { id: parseInt(convId) } });
            if (existingConv) currentSummary = existingConv.summary;
        }

        // 3. Tentukan Tipe Pesan
        let messageType = 'text';
        if (file) {
            if (file.mimetype.startsWith('image')) messageType = 'image';
            else if (file.mimetype.startsWith('audio')) messageType = 'audio';
            else messageType = 'document'; 
        }

        // Simpan User Message
        await prisma.message.create({
            data: {
                content: prompt + (file ? ` [File: ${file.originalname}]` : ""),
                role: 'user',
                conversationId: parseInt(convId),
                type: messageType
            }
        });

        // 4. Siapkan History
        const prevMessages = await prisma.message.findMany({
            where: { conversationId: parseInt(convId) },
            orderBy: { createdAt: 'asc' },
            take: 20
        });

        const history = prevMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // 5. PROSES FILE
        let filePart = null;
        if (file) {
            const buffer = fs.readFileSync(file.path);

            if (file.mimetype === 'application/pdf') {
                try {
                    const pdfData = await pdfParse(buffer);
                    filePart = { isImage: false, text: pdfData.text };
                } catch (err) {
                    console.error("Gagal baca PDF:", err);
                }
            } else if (file.mimetype === 'text/plain') {
                filePart = { isImage: false, text: buffer.toString('utf-8') };
            } else if (file.mimetype.startsWith('image')) {
                filePart = {
                    isImage: true,
                    data: { inlineData: { data: buffer.toString("base64"), mimeType: file.mimetype } }
                };
            } else if (file.mimetype.startsWith('audio')) {
                filePart = {
                    isAudio: true,
                    data: { inlineData: { data: buffer.toString("base64"), mimeType: file.mimetype } }
                };
            }
        }

        // 6. Panggil Gemini (Kirim Prompt + FilePart + MEMORY)
        let aiResponseText = await getGeminiResponse(prompt, history, mode, filePart, currentSummary);
        
        // === LOGIC GENERATE IMAGE ===
        let aiMessageType = 'text';
        let finalContent = aiResponseText;

        if (aiResponseText.startsWith('IMAGE_GEN:')) {
            const imagePrompt = aiResponseText.replace('IMAGE_GEN:', '').trim();
            const encodedPrompt = encodeURIComponent(imagePrompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true`;
            
            aiMessageType = 'image_url';
            finalContent = imageUrl;
        }

        // 7. Simpan AI Message
        await prisma.message.create({
            data: {
                content: finalContent,
                role: 'model',
                conversationId: parseInt(convId),
                type: aiMessageType
            }
        });

        // === 8. UPDATE MEMORI (AUTO SUMMARIZE) ===
        const totalMessages = await prisma.message.count({ where: { conversationId: parseInt(convId) } });
        
        if (totalMessages > 5 && totalMessages % 5 === 0) {
            const recentChats = prevMessages.slice(-10).map(m => `${m.role}: ${m.content}`).join("\n");
            summarizeChat(currentSummary, recentChats).then(newSummary => {
                prisma.conversation.update({
                    where: { id: parseInt(convId) },
                    data: { summary: newSummary }
                }).catch(err => console.error("Gagal update summary DB", err));
            });
        }

        if(file && fs.existsSync(file.path)) fs.unlinkSync(file.path);

        res.json({ 
            response: finalContent, 
            messageType: aiMessageType, 
            conversationId: convId, 
            tokensLeft: user.role === 'ADMIN' ? 'UNLIMITED' : user.tokens - 1 
        });

    } catch (error) {
        console.error(error);
        if(req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "MengAi lagi pusing (Server Error)" });
    }
};

// ... (Sisanya export function lain sama) ...
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const convs = await prisma.conversation.findMany({ where: { userId }, include: { messages: true }, orderBy: { createdAt: 'desc' } });
        res.json(convs);
    } catch (error) { res.status(500).json({ error: "Gagal ambil history" }); }
};

exports.deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const conv = await prisma.conversation.findFirst({ where: { id: parseInt(id), userId: userId } });
        if (!conv) return res.status(404).json({ error: "Chat ga ketemu!" });
        await prisma.message.deleteMany({ where: { conversationId: parseInt(id) } });
        await prisma.conversation.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Chat berhasil dihapus!" });
    } catch (error) { res.status(500).json({ error: "Gagal menghapus chat" }); }
};