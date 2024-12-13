 // src/routes/marketAnalysisRoutes.js  
const express = require('express');  
const router = express.Router();  
const auth = require('../middleware/auth');  
const marketAnalysisController = require('../controllers/marketAnalysisController');  

// Get all analysis views  
router.get('/bullish', auth, marketAnalysisController.getBullishStocks);  
router.get('/buy-sell', auth, marketAnalysisController.getBuySellSignals);  
router.get('/momentum', auth, marketAnalysisController.getMomentumAnalysis);  

// Get analysis for specific ticker  
router.get('/ticker/:ticker', auth, marketAnalysisController.getTickerAnalysis);  

module.exports = router;  