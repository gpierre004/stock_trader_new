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
router.get('/refresh-sp500', auth, stockController.refreshCompanies); // Added GET support
router.post('/refresh-sp500', auth, stockController.refreshCompanies); // Kept POST support
router.get('/active', stockController.getActiveCompanies);

module.exports = router;
