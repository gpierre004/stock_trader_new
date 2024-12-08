const yahooFinance = require('yahoo-finance2').default;  
const db = require('../models');
const { Op } = require('sequelize');  

// Suppress the historical deprecation notice
yahooFinance.setGlobalConfig({
  notifyRipHistorical: false
});

class StockPriceService {  
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async updateOrCreateStockPrice(data) {
    try {
      // Validate date before attempting database operation
      if (!data.date || isNaN(data.date.getTime())) {
        console.warn('Skipping invalid date for ticker:', data.ticker);
        return null;
      }

      // Verify company exists before creating stock price
      const companyExists = await db.Company.findOne({
        where: { ticker: data.ticker }
      });

      if (!companyExists) {
        console.warn(`Skipping stock price for non-existent company: ${data.ticker}`);
        return null;
      }

      const [stockPrice, created] = await db.StockPrice.findOrCreate({
        where: {
          ticker: data.ticker,
          date: data.date
        },
        defaults: {
          open: data.open || null,
          high: data.high || null,
          low: data.low || null,
          close: data.close || null,
          volume: data.volume || null,
          adjusted_close: data.adjusted_close || null
        }
      });

      if (!created) {
        await stockPrice.update({
          open: data.open || stockPrice.open,
          high: data.high || stockPrice.high,
          low: data.low || stockPrice.low,
          close: data.close || stockPrice.close,
          volume: data.volume || stockPrice.volume,
          adjusted_close: data.adjusted_close || stockPrice.adjusted_close
        });
      }

      return stockPrice;
    } catch (error) {
      console.error('Error updating/creating stock price:', error);
      throw error;
    }
  }

  // Rest of the existing code remains the same
}  

module.exports = StockPriceService;
