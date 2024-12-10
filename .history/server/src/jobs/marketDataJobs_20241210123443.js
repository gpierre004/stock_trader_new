// src/jobs/marketDataJobs.js  
const cron = require('node-cron');  
const StockPriceService = require('../services/stockPriceService');  
const MarketMoverService = require('../services/marketMoverService');  
const logger = require('../utils/logger');  

class MarketDataJobs {  
    static initializeJobs() {  
        // Update prices every 5 minutes during market hours
        // This is more efficient than every minute and still provides good data granularity
        cron.schedule('*/15 9-16 * * 1-5', async () => {  
            logger.info('Starting consolidated market data update...');  
            try {  
                // Update stock prices first
                const priceResult = await StockPriceService.updateDailyPrices();  
                logger.info('Stock price update completed:', priceResult);

                // Calculate market movers based on the new prices
                const moverResult = await MarketMoverService.calculateMarketMovers();  
                logger.info('Market movers calculation completed:', moverResult);
            } catch (error) {  
                logger.error('Failed to update market data:', error);  
            }  
        }, {  
            timezone: "America/New_York",
            immediate: false  // Prevent immediate execution at startup
        });  

        // Weekly historical data update (Sunday at midnight)
        cron.schedule('0 0 * * 0', async () => {  
            logger.info('Starting weekly historical data update...');  
            try {  
                const result = await StockPriceService.updateHistoricalDataForAllCompanies();  
                logger.info('Weekly historical data update completed:', result);  
            } catch (error) {  
                logger.error('Failed to update historical data:', error);  
            }  
        }, {  
            timezone: "America/New_York",
            immediate: false
        });  
    }  
}  

module.exports = MarketDataJobs;
