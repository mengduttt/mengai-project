const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const path = require('path');
require('dotenv').config();

const app = express();

// === FIX CORS: IZINKAN SEMUA PINTU MASUK ===
app.use(cors({
    origin: '*', // Tanda bintang artinya: "Siapa aja boleh masuk"
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Izinkan kirim token/cookie
}));

// Handle Preflight Request (Penting buat Vercel)
app.options('*', cors());

app.use(express.json());

// Route Cek Server (Buat ngetes doang)
app.get('/', (req, res) => {
    res.send("MengAi Backend is Running! 🚀 CORS All Allowed.");
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 MengAi Server running on port ${PORT}`));