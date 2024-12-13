const express = require('express');
const { MarketDataController } = require('../controllers/MarketDataController');
const { MarketDataService } = require('../services/MarketDataService');

const router = express.Router();
const marketDataService = new MarketDataService();
const marketDataController = new MarketDataController(marketDataService);

router.get('/overview', marketDataController.getMarketOverview.bind(marketDataController));
router.get('/market-movers', marketDataController.getMarketMovers.bind(marketDataController));
router.get('/bullish-stocks', marketDataController.getBullishStocks.bind(marketDataController));
router.get('/buy-sell-signals', marketDataController.getBuySellSignals.bind(marketDataController));
router.get('/momentum-analysis', marketDataController.getMomentumAnalysis.bind(marketDataController));

module.exports = router;
