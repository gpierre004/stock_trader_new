const yahooFinance = require('yahoo-finance2').default;  
const db = require('../models');
const { Op } = require('sequelize');  

yahooFinance.setGlobalConfig({
  notifyRipHistorical: false
});

class StockPriceService {  
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async fetchWithRetry(ticker, queryOptions, retryCount = 0) {
    try {
      const result = await yahooFinance.chart(ticker, queryOptions);
      if (!result || !result.quotes || result.quotes.length === 0) {
        throw new Error('No data returned from Yahoo Finance');
      }
      return result.quotes;
    } catch (error) {
      if (error.message.includes('Too Many Requests') && retryCount < 3) {
        await this.sleep(30000);
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

  static async processHistoricalBatch(companies, startDate) {
    const results = [];
    
    for (const company of companies) {
      try {
        const queryOptions = {  
          period1: startDate,
          period2: new Date(),
          interval: '1d'
        };

        await this.sleep(2000);
        const quotes = await this.fetchWithRetry(company.ticker, queryOptions);
        let processedCount = 0;

        for (const quote of quotes) {
          if (!quote.timestamp || !quote.close) continue;

          const date = new Date(quote.timestamp * 1000);
          await this.updateOrCreateStockPrice({
            ticker: company.ticker,
            date: date,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            close: quote.close,
            volume: quote.volume,
            adjusted_close: quote.adjclose || quote.close
          });
          processedCount++;
        }

        results.push({
          success: true,
          ticker: company.ticker,
          recordsProcessed: processedCount
        });
        console.log(`Successfully processed ${processedCount} records for ${company.ticker}`);
      } catch (error) {
        console.error(`Error processing historical data for ${company.ticker}:`, error);
        results.push({
          success: false,
          ticker: company.ticker,
          error: error.message
        });
      }
    }
    return results;
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
        totalRecordsProcessed: 0,
        errors: [],
        timestamp: new Date()
      };  

      const batchSize = 5;
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        const batchResults = await this.processHistoricalBatch(batch, threeYearsAgo);
        
        batchResults.forEach(result => {
          if (result.success) {
            results.success++;
            results.totalRecordsProcessed += result.recordsProcessed;
          } else {
            results.failed++;
            results.errors.push({
              ticker: result.ticker,
              error: result.error
            });
          }
        });

        if (i + batchSize < companies.length) {
          await this.sleep(15000);
        }
      }

      return results;  
    } catch (error) {  
      console.error('Error updating historical data:', error);  
      throw error;  
    }  
  }  

  static async updateStockPrices() {
    return this.updateDailyPrices();
  }

  static async processDailyPriceBatch(companies, today) {
    return Promise.all(companies.map(async (company) => {
      try {
        const quote = await yahooFinance.quote(company.ticker);
        if (!quote || !quote.regularMarketPrice) {
          return { success: false, ticker: company.ticker, error: 'Invalid quote data' };
        }

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
        return { success: true, ticker: company.ticker };
      } catch (error) {
        return { success: false, ticker: company.ticker, error: error.message };
      }
    }));
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

      const batchSize = 10;
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        const batchResults = await this.processDailyPriceBatch(batch, today);
        
        batchResults.forEach(result => {
          if (result.success) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push({
              ticker: result.ticker,
              error: result.error
            });
          }
        });

        if (i + batchSize < companies.length) {
          await this.sleep(5000);
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
