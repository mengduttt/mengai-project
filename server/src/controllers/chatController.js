const { PrismaClient } = require('@prisma/client');
const { getGeminiResponse, summarizeChat } = require('../utils/gemini');
const fs = require('fs');
const pdfParse = require('pdf-parse'); 
const mammoth = require('mammoth');

const prisma = new PrismaClient();

// === SEND MESSAGE ===
exports.sendMessage = async (req, res) => {
    try {
        const { prompt, conversationId, mode } = req.body;
        const userId = req.user.id;
        const file = req.file; 

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

        let convId = conversationId ? parseInt(conversationId) : null;
        let existingConversation = null;
        
        if (convId) {
            existingConversation = await prisma.conversation.findUnique({
                where: { id: convId },
                include: {
                    messages: {
                        where: {
                            role: { in: ['user', 'model'] }  // Only valid roles
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
        } else {
            const newConv = await prisma.conversation.create({
                data: { userId, title: prompt.substring(0, 50) }
            });
            convId = newConv.id;
            existingConversation = { messages: [], summary: null };
        }

        let memory = existingConversation.summary;
        if (existingConversation.messages.length >= 10 && !existingConversation.summary) {
            const messagesToSummarize = existingConversation.messages
                .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
                .join('\n');
            const newSummary = await summarizeChat(memory, messagesToSummarize);
            await prisma.conversation.update({
                where: { id: convId },
                data: { summary: newSummary }
            });
            memory = newSummary;
        }

        let filePart = null;
        if (file) {
            const fileMimeType = file.mimetype;

            if (fileMimeType.startsWith('image/')) {
                const imageData = fs.readFileSync(file.path, { encoding: 'base64' });
                filePart = {
                    isImage: true,
                    data: {
                        inlineData: {
                            data: imageData,
                            mimeType: fileMimeType
                        }
                    }
                };
                fs.unlinkSync(file.path);
            }
            else if (file.mimetype === 'application/pdf') {
                const dataBuffer = fs.readFileSync(file.path);
                const pdfData = await pdfParse(dataBuffer);
                filePart = {
                    isPdf: true,
                    text: pdfData.text
                };
                fs.unlinkSync(file.path);
            }
            // DOCX support (.doc/.docx)
            else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                     file.mimetype === 'application/msword') {
                const dataBuffer = fs.readFileSync(file.path);
                const docxData = await mammoth.extractRawText({ buffer: dataBuffer });
                filePart = {
                    isDocx: true,
                    text: docxData.value
                };
                fs.unlinkSync(file.path);
            }
            else if (fileMimeType.startsWith('audio/')) {
                const audioData = fs.readFileSync(file.path, { encoding: 'base64' });
                filePart = {
                    isAudio: true,
                    data: {
                        inlineData: {
                            data: audioData,
                            mimeType: fileMimeType
                        }
                    }
                };
                fs.unlinkSync(file.path);
            }
        }

        // Map and filter history - remove any messages with invalid roles
        const history = existingConversation.messages
            .filter(msg => msg.role && (msg.role === 'user' || msg.role === 'model'))
            .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

        const aiResponse = await getGeminiResponse(prompt, history, mode, filePart, memory);

        await prisma.message.create({
            data: { conversationId: convId, role: 'user', content: prompt }
        });

        await prisma.message.create({
            data: { conversationId: convId, role: 'model', content: aiResponse }
        });

        res.json({ aiResponse, conversationId: convId });

    } catch (error) {
        console.error('SendMessage Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// === GET HISTORY ===
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await prisma.conversation.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        res.json({ conversations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal load history" });
    }
};

// === DELETE CONVERSATION ===
exports.deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const conv = await prisma.conversation.findFirst({ 
            where: { id: parseInt(id), userId: userId } 
        });
        if (!conv) return res.status(404).json({ error: "Chat ga ketemu!" });
        
        await prisma.message.deleteMany({ where: { conversationId: parseInt(id) } });
        await prisma.conversation.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Chat berhasil dihapus!" });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ error: "Gagal menghapus chat" });
    }
};