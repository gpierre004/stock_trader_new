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
router.post('/companies/refresh', auth, stockController.refreshCompanies);
router.get('/companies/active', stockController.getActiveCompanies);
router.put('/companies/:ticker', auth, stockController.updateCompany);

module.exports = router;
