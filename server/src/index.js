// src/index.js
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();

// 🔹 Ambil origin dari ENV, jadi bisa beda antara local & production
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Preflight
app.options('*', cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('MengAi Backend is Running! 🚀 CORS Configured.');
});

// 🔹 Semua route di api.js dipasang di prefix /api
app.use('/api', apiRoutes);

// 🔹 Untuk Railway: PORT harus dari env (mereka yang set)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 MengAi Server running on port ${PORT}`));
