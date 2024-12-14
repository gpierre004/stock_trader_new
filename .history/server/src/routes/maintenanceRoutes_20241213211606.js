const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const auth = require('../middleware/auth');

// Route to trigger market data update
router.post('/update-market-data', auth, maintenanceController.updateMarketData);

// Route to trigger watchlist update
router.post('/update-watchlist', auth, maintenanceController.updateWatchlist);

// Route to sync missing companies from transactions
router.post('/sync-missing-companies', auth, maintenanceController.syncMissingCompanies);

module.exports = router;
