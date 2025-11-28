const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const path = require('path');
require('dotenv').config();

const app = express();

const allowedOrigin = 'https://mengai-project-2xa4.vercel.app';

app.use(cors({
    origin: allowedOrigin,                // ⬅️ GANTI dari '*' jadi domain frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true                     // ⬅️ boleh pakai ini, tapi origin nggak boleh '*'
}));

// Preflight
app.options('*', cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send("MengAi Backend is Running! 🚀 CORS All Allowed.");
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 MengAi Server running on port ${PORT}`));
