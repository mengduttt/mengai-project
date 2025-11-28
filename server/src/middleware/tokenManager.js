const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tokenManager = async (req, res, next) => {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user.role === 'ADMIN') {
        return next(); // Sultan bebas lewat
    }

    const now = new Date();
    const lastReset = new Date(user.lastReset);
    const diffHours = Math.abs(now - lastReset) / 36e5; // Hitung beda jam

    // Logic Reset
    if (user.tokens <= 0) {
        if (diffHours >= 3) {
            // Sudah 3 jam, reset token
            await prisma.user.update({
                where: { id: userId },
                data: { tokens: 300, lastReset: now }
            });
        } else {
            // Belum 3 jam, tolak
            const timeLeft = (3 - diffHours).toFixed(1);
            return res.status(429).json({ 
                error: `Token habis bro! Tunggu cooldown ${timeLeft} jam lagi ya atau minta admin.` 
            });
        }
    } else {
        // Kalau token belum habis tapi udah lewat 3 jam, reset juga biar fresh (opsional, tapi bagus)
        if (diffHours >= 3) {
            await prisma.user.update({
                where: { id: userId },
                data: { tokens: 300, lastReset: now }
            });
        }
    }

    next();
};

module.exports = tokenManager;