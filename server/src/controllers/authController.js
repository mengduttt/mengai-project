const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer');

const prisma = new PrismaClient();

// === REGISTER USER BARU ===
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Cek username atau email udah ada belum
        const existingUser = await prisma.user.findFirst({
            where: { 
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) return res.status(400).json({ error: "Username atau Email sudah terdaftar!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Buat user baru (Default token 300)
        await prisma.user.create({
            data: { 
                username, 
                email, 
                password: hashedPassword, 
                role: 'USER', 
                tokens: 300 
            }
        });

        res.status(201).json({ message: "Register berhasil! Silakan login." });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Gagal register." });
    }
};

// === LOGIN USER ===
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) return res.status(400).json({ error: "User ga ketemu." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Password salah!" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role, tokens: user.tokens }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Gagal login." });
    }
};

// === GET MY PROFILE ===
exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ 
            where: { id: req.user.id },
            select: { id: true, username: true, email: true, role: true, tokens: true } 
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Gagal ambil profil" });
    }
};

// === UPDATE PROFILE ===
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, newPassword } = req.body;

        const dataToUpdate = {};

        if (username) {
            const existingUser = await prisma.user.findFirst({
                where: { 
                    username: username,
                    NOT: { id: userId } 
                }
            });
            if (existingUser) return res.status(400).json({ error: "Username udah dipake orang lain!" });
            dataToUpdate.username = username;
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(newPassword, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: { id: true, username: true, role: true, tokens: true }
        });

        res.json({ message: "Profil berhasil diupdate!", user: updatedUser });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Gagal update profil" });
    }
};

// === LUPA PASSWORD (Minta Link) ===
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "Email ga terdaftar di MengAi." });

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 Jam

        await prisma.user.update({
            where: { id: user.id },
            data: { 
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetTokenExpires
            }
        });

        // === PERBAIKAN UTAMA: GUNAKAN CLIENT_URL DARI ENV ===
        // Biar pas deploy, linknya ngikutin domain Vercel, bukan localhost terus
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
        
        const message = `Klik link ini buat reset password akun MengAi:\n\n${resetUrl}\n\nLink ini kadaluarsa dalam 1 jam.`;

        await sendEmail(user.email, "Reset Password MengAi", message);

        res.json({ message: "Cek email lu! Link reset udah dikirim." });

    } catch (error) {
        console.error("Forgot Pass Error:", error);
        res.status(500).json({ error: "Gagal kirim email reset." });
    }
};

// === RESET PASSWORD (Eksekusi) ===
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            }
        });

        if (!user) return res.status(400).json({ error: "Token tidak valid atau sudah kadaluarsa!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        res.json({ message: "Password berhasil direset! Silakan login." });

    } catch (error) {
        console.error("Reset Error:", error);
        res.status(500).json({ error: "Gagal reset password." });
    }
};