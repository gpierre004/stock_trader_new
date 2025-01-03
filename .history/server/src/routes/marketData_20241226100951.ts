import express from 'express';
import { container } from '../infrastructure/di/container';
import { MarketDataController } from '../controllers/MarketDataController';

const router = express.Router();
const marketDataController = container.get<MarketDataController>(MarketDataController);

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

// CommonJS and ES Module compatibility
export = router;
