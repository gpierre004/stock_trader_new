const yahooFinance = require('yahoo-finance2').default;  
const db = require('../models');
const { Op } = require('sequelize');  

class StockPriceService {  
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async fetchWithRetry(ticker, queryOptions, retryCount = 0) {
    try {
      return await yahooFinance.historical(ticker, queryOptions);
    } catch (error) {
      if (error.message.includes('Too Many Requests') && retryCount < 3) {
        const waitTime = Math.pow(2, retryCount) * 15000; // Exponential backoff: 15s, 30s, 60s
        console.log(`Rate limited for ${ticker}, waiting ${waitTime/1000} seconds and retrying... (Attempt ${retryCount + 1}/3)`);
        await this.sleep(waitTime);
        return this.fetchWithRetry(ticker, queryOptions, retryCount + 1);
      }
      throw error;
    }
  }

  static async updateOrCreateStockPrice(data) {
    try {
      const [stockPrice, created] = await db.StockPrice.findOrCreate({
        where: {
          ticker: data.ticker,
          date: data.date
        },
        defaults: {
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volume,
          adjusted_close: data.adjusted_close
        }
      });

      if (!created) {
        await stockPrice.update({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volume,
          adjusted_close: data.adjusted_close
        });
      }

      return stockPrice;
    } catch (error) {
      console.error('Error updating/creating stock price:', error);
      throw error;
    }
  }

  static async fetchAndUpdateHistoricalData(ticker, startDate) {  
    const queryOptions = {  
      period1: startDate,
      period2: new Date(),
      interval: '1d'
    };  

    try {  
      // Add delay between requests to avoid rate limiting
      await this.sleep(5000); // 5 second base delay

      // Using fetchWithRetry for better rate limit handling
      const historicalData = await this.fetchWithRetry(ticker, queryOptions);

      // Process each historical data point  
      for (const data of historicalData) {  
        await this.updateOrCreateStockPrice({
          ticker,  
          date: data.date,  
          open: data.open,  
          high: data.high,  
          low: data.low,  
          close: data.close,  
          volume: data.volume,  
          adjusted_close: data.adjClose  
        });
      }  

      return {  
        ticker,  
        recordsProcessed: historicalData.length  
      };  
    } catch (error) {  
      console.error(`Error fetching historical data for ${ticker}:`, error);  
      throw error;  
    }  
  }  

  static async updateHistoricalDataForAllCompanies() {  
    try {  
      const companies = await db.Company.findAll({  
        where: { active: true },  
        attributes: ['ticker']  
      });  

      const threeYearsAgo = new Date();  
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);  

      const results = {  
        success: 0,  
        failed: 0,  
        errors: [],
        timestamp: new Date()
      };  

      // Process companies in smaller batches
      const batchSize = 5; // Reduced batch size
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        
        // Process each company in the batch
        for (const company of batch) {  
          try {  
            await this.fetchAndUpdateHistoricalData(company.ticker, threeYearsAgo);  
            results.success++;  
          } catch (error) {  
            results.failed++;  
            results.errors.push({  
              ticker: company.ticker,  
              error: error.message  
            });  
          }
        }

        // Add longer delay between batches
        if (i + batchSize < companies.length) {
          await this.sleep(15000); // 15 second delay between batches
        }
      }  

      return results;  
    } catch (error) {  
      console.error('Error updating historical data:', error);  
      throw error;  
    }  
  }  

  static async updateDailyPrices() {  
    try {  
      const companies = await db.Company.findAll({  
        where: { active: true },  
        attributes: ['ticker']  
      });  

      const today = new Date();  
      today.setHours(0, 0, 0, 0);  

      const results = {  
        success: 0,  
        failed: 0,  
        errors: [],
        timestamp: new Date()
      };  

      // Process companies in smaller batches
      const batchSize = 5; // Reduced batch size
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        
        // Process each company in the batch
        for (const company of batch) {  
          try {  
            await this.sleep(3000); // 3 second delay between quotes
            const quote = await yahooFinance.quote(company.ticker);  

            await this.updateOrCreateStockPrice({
              ticker: company.ticker,
              date: today,
              open: quote.regularMarketOpen,
              high: quote.regularMarketDayHigh,
              low: quote.regularMarketDayLow,
              close: quote.regularMarketPrice,
              volume: quote.regularMarketVolume,
              adjusted_close: quote.regularMarketPrice
            });

            results.success++;  
          } catch (error) {  
            results.failed++;  
            results.errors.push({  
              ticker: company.ticker,  
              error: error.message  
            });  
          }
        }

        // Add longer delay between batches
        if (i + batchSize < companies.length) {
          await this.sleep(15000); // 15 second delay between batches
        }
      }  

      return results;  
    } catch (error) {  
      console.error('Error updating daily prices:', error);  
      throw error;  
    }  
  }  
}  

module.exports = StockPriceService;
