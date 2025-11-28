const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const path = require('path');
require('dotenv').config();

const app = express();

// === FIX CORS (BUKA GERBANG) ===
app.use(cors({
    origin: '*', // Boleh diakses dari mana aja (termasuk frontend lu yang beda-beda linknya)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Izinkan semua aksi
    allowedHeaders: ['Content-Type', 'Authorization'], // Izinkan header penting
    credentials: true
}));

// Handle Preflight Request (Penting buat Vercel biar ga merah)
app.options('*', cors());

app.use(express.json());

// Serve Static Folder (Opsional)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Route Cek Server
app.get('/', (req, res) => {
    res.send("MengAi Server is Running! 🚀 CORS Aman.");
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 MengAi Server running on port ${PORT}`));