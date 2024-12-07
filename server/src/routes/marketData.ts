// src/interfaces/http/routes/marketData.ts  
const router = express.Router();  
const marketDataController = new MarketDataController(marketDataService);  

router.get('/market-movers', marketDataController.getMarketMovers.bind(marketDataController));  