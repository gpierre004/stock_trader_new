// src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

// Transaction routes (all require authentication)
router.post('/buy', auth, transactionController.buyStock);
router.post('/sell', auth, transactionController.sellStock);
router.get('/history', auth, transactionController.getTransactionHistory);
router.get('/portfolio', auth, transactionController.getPortfolio);
router.get('/performance', auth, transactionController.getPortfolioPerformance);
router.get('/positions', auth, transactionController.getCurrentPositions);

module.exports = router;
