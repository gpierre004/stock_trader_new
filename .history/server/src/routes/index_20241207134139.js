// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const stockRoutes = require('./stockRoutes');
const transactionRoutes = require('./transactionRoutes');
const watchlistRoutes = require('./watchlistRoutes');

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/stocks', stockRoutes);
router.use('/transactions', transactionRoutes);
router.use('/watchlists', watchlistRoutes);

module.exports = router;
