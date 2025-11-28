const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"MengAi Security" <${process.env.EMAIL_USER}>`,
            to: email, // Email tujuan (User)
            subject: subject,
            text: text,
        });

        console.log("Email terkirim ke:", email);
        return true;
    } catch (error) {
        console.error("Gagal kirim email:", error);
        return false;
    }
};

module.exports = sendEmail;