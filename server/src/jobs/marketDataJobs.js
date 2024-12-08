// src/jobs/marketDataJobs.js  
const cron = require('node-cron');  
const StockPriceService = require('../services/stockPriceService');  
const MarketMoverService = require('../services/marketMoverService');  
const logger = require('../utils/logger');  

class MarketDataJobs {  
    static initializeJobs() {  
        // Update prices every minute during market hours  
        cron.schedule('* 9-16 * * 1-5', async () => {  
            logger.info('Starting scheduled stock price update...');  
            try {  
                const result = await StockPriceService.updateStockPrices();  
                logger.info('Stock price update completed:', result);  
            } catch (error) {  
                logger.error('Failed to update stock prices:', error);  
            }  
        }, {  
            timezone: "America/New_York"  
        });  

        // Calculate market movers every 5 minutes  
        cron.schedule('*/5 9-16 * * 1-5', async () => {  
            logger.info('Starting market movers calculation...');  
            try {  
                const result = await MarketMoverService.calculateMarketMovers();  
                logger.info('Market movers calculation completed:', result);  
            } catch (error) {  
                logger.error('Failed to calculate market movers:', error);  
            }  
        }, {  
            timezone: "America/New_York"  
        });  
    }  
}  

module.exports = MarketDataJobs;  