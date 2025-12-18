// src/index.js
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();

// 🔹 Allow multiple origins (local + production)
const allowedOrigins = [
  'http://localhost:5173',
  'https://mengai-project-2xa4.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean); // Remove undefined

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Preflight
app.options('*', cors({
  origin: allowedOrigins,
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
