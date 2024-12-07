// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Get all users route
router.get('/', userController.getAllUsers);

// Authentication routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/logout', auth, userController.logout);
router.get('/verify-token', auth, userController.verifyToken);

module.exports = router;
