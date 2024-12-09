// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/logout', auth, userController.logout);
router.get('/verify-token', auth, userController.verifyToken);

// Admin routes
router.get('/', auth, userController.getAllUsers);

module.exports = router;
