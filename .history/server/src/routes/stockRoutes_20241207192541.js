// src/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stockController = require('../controllers/stockController');

// Stock market data routes
router.get('/quotes/:symbol', stockController.getQuote);
router.get('/historical/:symbol', stockController.getHistoricalData);
router.get('/market-movers', stockController.getMarketMovers);
router.get('/search', stockController.searchStocks);

// SP500 refresh routes - multiple patterns to be more forgiving with URL format
router.get('/refresh-sp500', stockController.refreshCompanies);
router.get('refresh-sp500', stockController.refreshCompanies); // Handle without leading slash
router.get('/companies/refresh-sp500', stockController.refreshCompanies); // Legacy pattern support
router.get('companies/refresh-sp500', stockController.refreshCompanies); // Legacy pattern without leading slash

// Ensure the method exists before adding the route
router.post('/update-market-data', auth.authenticateToken, (req, res) => {
    if (typeof stockController.updateMarketData === 'function') {
        stockController.updateMarketData(req, res);
    } else {
        res.status(500).json({ 
            message: 'updateMarketData method is not defined', 
            error: 'Internal server configuration error' 
        });
    }
});

router.get('/active', stockController.getActiveCompanies);

// Debug route
router.get('/', (req, res) => {
    res.json({
        message: 'Stock routes are working',
        availableEndpoints: [
            '/quotes/:symbol',
            '/historical/:symbol',
            '/market-movers',
            '/search',
            '/refresh-sp500',
            '/companies/refresh-sp500',
            '/update-market-data',
            '/active'
        ]
    });
});

module.exports = router;
