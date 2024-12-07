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
router.use('/stocks', stockRoutes); // This mounts all stock routes under /api/stocks
router.use('/transactions', transactionRoutes);
router.use('/watchlists', watchlistRoutes);

// Debug route to list all registered routes
router.get('/routes', (req, res) => {
    const routes = [];
    router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    routes.push({
                        path: '/api' + middleware.regexp.source.replace('\\/?(?=\\/|$)', '') + handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.json(routes);
});

module.exports = router;
