// src/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stockController = require('../controllers/stockController');
const StockPriceService = require('../services/stockPriceService');
const MarketMoverService = require('../services/marketMoverService');

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

// New route for manual market data update - with authentication
router.post('/update-market-data', auth, async (req, res) => {
    try {
        // Perform stock price update
        const stockPriceUpdateResult = await StockPriceService.updateDailyPrices();
        
        // Calculate market movers
        const marketMoversResult = await MarketMoverService.calculateMarketMovers();

        res.json({
            message: 'Market data updated successfully',
            stockPriceUpdate: stockPriceUpdateResult,
            marketMoversUpdate: marketMoversResult
        });
    } catch (error) {
        console.error('Error updating market data:', error);
        res.status(500).json({ 
            message: 'Failed to update market data', 
            error: error.message 
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
