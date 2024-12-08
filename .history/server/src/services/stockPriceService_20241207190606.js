const yahooFinance = require('yahoo-finance2').default;  
const db = require('../models');
const { Op } = require('sequelize');  

class StockPriceService {  
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async fetchAndUpdateHistoricalData(ticker, startDate) {  
    // Define queryOptions outside try block so it's accessible in catch block
    const queryOptions = {  
      period1: startDate,
      period2: new Date(),
      interval: '1d'
    };  

    try {  
      // Add delay between requests to avoid rate limiting
      await this.sleep(2000); // 2 second delay

      // Using the correct method for yahoo-finance2
      const historicalData = await yahooFinance.historical(ticker, queryOptions);

      // Process each historical data point  
      for (const data of historicalData) {  
        await db.StockPrice.upsert({  
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
      // If we hit rate limit, wait longer and retry once
      if (error.message.includes('Too Many Requests')) {
        try {
          console.log(`Rate limited for ${ticker}, waiting 10 seconds and retrying...`);
          await this.sleep(10000); // 10 second delay for retry
          const historicalData = await yahooFinance.historical(ticker, queryOptions);
          
          for (const data of historicalData) {  
            await db.StockPrice.upsert({  
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
        } catch (retryError) {
          console.error(`Error after retry for ${ticker}:`, retryError);
          throw retryError;
        }
      }
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
      const batchSize = 10;
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

        // Add delay between batches
        if (i + batchSize < companies.length) {
          await this.sleep(5000); // 5 second delay between batches
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
      const batchSize = 10;
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        
        // Process each company in the batch
        for (const company of batch) {  
          try {  
            await this.sleep(1000); // 1 second delay between quotes
            const quote = await yahooFinance.quote(company.ticker);  

            await db.StockPrice.upsert({  
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

        // Add delay between batches
        if (i + batchSize < companies.length) {
          await this.sleep(5000); // 5 second delay between batches
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
