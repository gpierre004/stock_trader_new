const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const stockRoutes = require('./stockRoutes');
const transactionRoutes = require('./transactionRoutes');
const watchlistRoutes = require('./watchlistRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const marketDataRoutes = require('./marketData');
const cashRoutes = require('./cashRoutes');

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Debug route to show available endpoints
router.get('/', (req, res) => {
    res.json({
        message: 'API is working',
        availableEndpoints: {
            stocks: '/api/stocks/*',
            users: '/api/users/*',
            transactions: '/api/transactions/*',
            watchlists: '/api/watchlists/*',
            maintenance: '/api/maintenance/*',
            marketData: '/api/market-data/*',
            debug: '/api/routes'
        }
    });
});

// Mount routes
router.use('/stocks', stockRoutes);
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);
router.use('/watchlists', watchlistRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/market-data', marketDataRoutes);
router.use('/cash', cashRoutes);

// Debug route to list all registered routes
router.get('/routes', (req, res) => {
    const routes = [];
    
    // Helper function to extract routes from a router
    const extractRoutes = (stack, prefix = '') => {
        stack.forEach(layer => {
            if (layer.route) {
                routes.push({
                    path: prefix + layer.route.path,
                    methods: Object.keys(layer.route.methods)
                });
            } else if (layer.name === 'router') {
                // Recursively extract routes from nested routers
                extractRoutes(layer.handle.stack, prefix + layer.regexp.source.replace('\\/?(?=\\/|$)', ''));
            }
        });
    };

    // Extract routes from all mounted routers
    router.stack.forEach(middleware => {
        if (middleware.name === 'router') {
            extractRoutes(middleware.handle.stack, '/api' + middleware.regexp.source.replace('\\/?(?=\\/|$)', ''));
        }
    });

    res.json({
        message: 'Available routes',
        routes: routes
    });
});

module.exports = router;
