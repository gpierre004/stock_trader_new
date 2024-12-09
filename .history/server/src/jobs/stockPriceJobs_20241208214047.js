// src/jobs/stockPriceJobs.js  
const cron = require('node-cron');  
const StockPriceService = require('../services/stockPriceService');  
const logger = require('../utils/logger');  

class StockPriceJobs {  
  static initializeJobs() {  
    // Update prices every minute during market hours  
    cron.schedule('* 9-16 * * 1-5', async () => {  
      logger.info('Starting daily price update...');  
      try {  
        const result = await StockPriceService.updateDailyPrices();  
        logger.info('Daily price update completed:', result);  
      } catch (error) {  
        logger.error('Failed to update daily prices:', error);  
      }  
    }, {  
      timezone: "America/New_York",
      // Prevent the job from running immediately at startup
      immediate: false
    });  

    // Update historical data weekly (Sunday at midnight)  
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
      // Prevent the job from running immediately at startup
      immediate: false
    });  
  }  
}  

module.exports = StockPriceJobs;
