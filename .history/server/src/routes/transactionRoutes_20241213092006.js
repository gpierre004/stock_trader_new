const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Route to load template data
router.post('/load-template', auth, transactionController.loadTemplateData);

// Route to create a new transaction
router.post('/', auth, transactionController.createTransaction);

// Route to get portfolio tickers
router.get('/tickers', auth, transactionController.getPortfolioTickers);

module.exports = router;
