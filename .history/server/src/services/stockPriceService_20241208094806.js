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

  static async fetchWithRetry(ticker, queryOptions, retryCount = 0) {
    try {
      const result = await yahooFinance.chart(ticker, queryOptions);
      if (!result.quotes || result.quotes.length === 0) {
        throw new Error('No data returned from Yahoo Finance');
      }
      return result.quotes.map(quote => {
        if (!quote.timestamp) return null;
        const date = new Date(quote.timestamp * 1000);
        if (isNaN(date.getTime())) return null;
        return {
          date,
          open: quote.open || null,
          high: quote.high || null,
          low: quote.low || null,
          close: quote.close || null,
          volume: quote.volume || null,
          adjClose: quote.adjclose || null
        };
      }).filter(quote => quote !== null);
    } catch (error) {
      if (error.message.includes('Too Many Requests') && retryCount < 3) {
        const waitTime = Math.pow(2, retryCount) * 15000;
        console.log(`Rate limited for ${ticker}, waiting ${waitTime/1000} seconds and retrying... (Attempt ${retryCount + 1}/3)`);
        await this.sleep(waitTime);
        return this.fetchWithRetry(ticker, queryOptions, retryCount + 1);
      }
      throw error;
    }
  }

  static async updateOrCreateStockPrice(data) {
    try {
      if (!data.date || isNaN(data.date.getTime())) {
        console.warn('Skipping invalid date for ticker:', data.ticker);
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

  static async processHistoricalBatch(companies, startDate) {
    return Promise.all(companies.map(async (company) => {
      try {
        const queryOptions = {  
          period1: startDate,
          period2: new Date(),
          interval: '1d'
        };

        await this.sleep(1000); // Small delay to avoid rate limits
        const historicalData = await this.fetchWithRetry(company.ticker, queryOptions);
        let processedCount = 0;

        for (const data of historicalData) {
          try {
            await this.updateOrCreateStockPrice({
              ticker: company.ticker,
              date: data.date,
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
              volume: data.volume,
              adjusted_close: data.adjClose
            });
            processedCount++;
          } catch (error) {
            console.error(`Error processing data point for ${company.ticker} at ${data.date}:`, error);
            continue;
          }
        }

        return {
          success: true,
          ticker: company.ticker,
          recordsProcessed: processedCount
        };
      } catch (error) {
        console.error(`Error processing historical data for ${company.ticker}:`, error);
        return {
          success: false,
          ticker: company.ticker,
          error: error.message
        };
      }
    }));
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

      // Process in parallel batches of 10
      const batchSize = 10;
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(companies.length/batchSize)}`);
        
        const batchResults = await this.processHistoricalBatch(batch, threeYearsAgo);
        
        // Process results
        batchResults.forEach(result => {
          if (result.success) {
            results.success++;
            results.totalRecordsProcessed += result.recordsProcessed;
            console.log(`Successfully processed ${result.recordsProcessed} records for ${result.ticker}`);
          } else {
            results.failed++;
            results.errors.push({
              ticker: result.ticker,
              error: result.error
            });
            console.error(`Failed to process ${result.ticker}: ${result.error}`);
          }
        });

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < companies.length) {
          console.log('Waiting between batches...');
          await this.sleep(5000);
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
        if (quote && quote.regularMarketPrice) {
          await this.updateOrCreateStockPrice({
            ticker: company.ticker,
            date: today,
            open: quote.regularMarketOpen || null,
            high: quote.regularMarketDayHigh || null,
            low: quote.regularMarketDayLow || null,
            close: quote.regularMarketPrice || null,
            volume: quote.regularMarketVolume || null,
            adjusted_close: quote.regularMarketPrice || null
          });
          return { success: true, ticker: company.ticker };
        }
        return { success: false, ticker: company.ticker, error: 'Invalid quote data' };
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

      // Process in parallel batches of 50
      const batchSize = 50;
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        const batchResults = await this.processDailyPriceBatch(batch, today);
        
        // Process results
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

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < companies.length) {
          await this.sleep(2000);
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
