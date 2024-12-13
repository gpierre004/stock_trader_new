import express from 'express';
import { MarketDataController } from '../controllers/MarketDataController';
import { MarketDataService } from '../services/MarketDataService';

const router = express.Router();
const marketDataService = new MarketDataService();
const marketDataController = new MarketDataController(marketDataService);

// Market overview endpoint
router.get('/overview', marketDataController.getMarketOverview.bind(marketDataController));

// Market movers endpoint
router.get('/market-movers', marketDataController.getMarketMovers.bind(marketDataController));

// Bullish stocks endpoint
router.get('/bullish-stocks', marketDataController.getBullishStocks.bind(marketDataController));

// Buy/sell signals endpoint
router.get('/buy-sell-signals', marketDataController.getBuySellSignals.bind(marketDataController));

// Momentum analysis endpoint
router.get('/momentum-analysis', marketDataController.getMomentumAnalysis.bind(marketDataController));

export default router;
