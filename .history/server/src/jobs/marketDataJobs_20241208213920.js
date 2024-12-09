// src/jobs/marketDataJobs.js  
const cron = require('node-cron');  
const MarketMoverService = require('../services/marketMoverService');  
const logger = require('../utils/logger');  

class MarketDataJobs {  
    static initializeJobs() {  
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
