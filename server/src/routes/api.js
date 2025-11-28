// src/routes/api.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const tokenManager = require('../middleware/tokenManager');
const adminCheck = require('../middleware/adminCheck');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const upload = multer({ dest: 'uploads/' });

// ===== AUTH ROUTES =====
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/me', authMiddleware, authController.updateProfile);

// ===== CHAT ROUTES =====
router.post('/chat',
  authMiddleware,
  tokenManager,
  upload.single('image'),
  chatController.sendMessage
);

router.get('/history', authMiddleware, chatController.getHistory);
router.delete('/conversation/:id', authMiddleware, chatController.deleteConversation);

// ===== ADMIN ROUTES =====
router.get('/admin/stats', authMiddleware, adminCheck, adminController.getDashboardStats);
router.get('/admin/users', authMiddleware, adminCheck, adminController.getAllUsers);
router.put('/admin/users/:id/token', authMiddleware, adminCheck, adminController.refillToken);
router.delete('/admin/users/:id', authMiddleware, adminCheck, adminController.deleteUser);

// ===== PASSWORD RESET =====
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
