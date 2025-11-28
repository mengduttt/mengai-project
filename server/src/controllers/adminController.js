const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Ambil Statistik Dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalChats = await prisma.conversation.count();
        const totalMessages = await prisma.message.count();
        
        res.json({ totalUsers, totalChats, totalMessages });
    } catch (error) {
        res.status(500).json({ error: "Gagal ambil stats" });
    }
};

// 2. Ambil Semua User
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, role: true, tokens: true, lastReset: true },
            orderBy: { id: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Gagal ambil user" });
    }
};

// 3. Refill Token (Isi Ulang)
exports.refillToken = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body; // Jumlah token mau diisi berapa

        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { tokens: parseInt(amount) }
        });

        res.json({ message: `Berhasil isi ${amount} token!` });
    } catch (error) {
        res.status(500).json({ error: "Gagal isi token" });
    }
};

// 4. Ban User (Hapus User & Semua Chatnya)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Jangan biarkan admin menghapus dirinya sendiri
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: "Jangan bunuh diri bro!" });
        }

        // 1. Hapus Message dulu
        const userConvs = await prisma.conversation.findMany({ where: { userId: parseInt(id) } });
        const convIds = userConvs.map(c => c.id);
        
        await prisma.message.deleteMany({ where: { conversationId: { in: convIds } } });
        
        // 2. Hapus Conversation
        await prisma.conversation.deleteMany({ where: { userId: parseInt(id) } });

        // 3. Hapus User
        await prisma.user.delete({ where: { id: parseInt(id) } });

        res.json({ message: "User berhasil dimusnahkan!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal hapus user" });
    }
};