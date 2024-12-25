const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const auth = require('../middleware/auth');

// Route to refresh S&P 500 companies list
router.post('/refresh-sp500', auth, maintenanceController.refreshSP500List);

// Route to trigger market data update
router.post('/update-market-data', auth, maintenanceController.updateMarketData);

// Route to trigger watchlist update
router.post('/update-watchlist', auth, maintenanceController.updateWatchlist);

// Route to sync missing companies from transactions
router.post('/sync-missing-companies', auth, maintenanceController.syncMissingCompanies);

// Route to update full stock price history
router.post('/update-full-stock-history', auth, maintenanceController.updateFullStockHistory);

module.exports = router;
