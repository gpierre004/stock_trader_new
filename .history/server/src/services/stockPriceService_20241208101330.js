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
      console.log(`Fetching data for ${ticker}...`);
      const result = await yahooFinance.chart(ticker, queryOptions);
      
      if (!result || !result.quotes) {
        console.warn(`No data structure returned from Yahoo Finance for ${ticker}`);
        return [];
      }

      if (result.quotes.length === 0) {
        console.warn(`Empty quotes array returned from Yahoo Finance for ${ticker}`);
        return [];
      }

      console.log(`Received ${result.quotes.length} raw quotes for ${ticker}`);
      
      const validQuotes = result.quotes.map(quote => {
        if (!quote.timestamp) {
          console.warn(`Quote missing timestamp for ${ticker}`);
          return null;
        }
        
        const date = new Date(quote.timestamp * 1000);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date from timestamp ${quote.timestamp} for ${ticker}`);
          return null;
        }

        // Log any missing price data
        if (!quote.close) {
          console.warn(`Missing close price for ${ticker} on ${date.toISOString()}`);
        }

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

      console.log(`Processed ${validQuotes.length} valid quotes for ${ticker}`);
      return validQuotes;

    } catch (error) {
      console.error(`Error fetching data for ${ticker}:`, error.message);
      
      if (error.message.includes('Too Many Requests') || 
          error.message.includes('not valid JSON') ||
          error.message.includes('timeout')) {
        
        if (retryCount < 3) {  // Reduced max retries
          const waitTime = Math.pow(2, retryCount) * 45000;  // Increased base wait time to 45 seconds
          console.log(`Rate limited for ${ticker}, waiting ${waitTime/1000} seconds and retrying... (Attempt ${retryCount + 1}/3)`);
          await this.sleep(waitTime);
          return this.fetchWithRetry(ticker, queryOptions, retryCount + 1);
        }
      }
      throw error;
    }
  }

  static async updateOrCreateStockPrice(data) {
    try {
      if (!data.date || isNaN(data.date.getTime())) {
        console.warn(`Invalid date for ticker ${data.ticker}`);
        return null;
      }

      if (!data.close && !data.adjusted_close) {
        console.warn(`No price data for ${data.ticker} on ${data.date}`);
        return null;
      }

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
          open: data.open !== null ? data.open : stockPrice.open,
          high: data.high !== null ? data.high : stockPrice.high,
          low: data.low !== null ? data.low : stockPrice.low,
          close: data.close !== null ? data.close : stockPrice.close,
          volume: data.volume !== null ? data.volume : stockPrice.volume,
          adjusted_close: data.adjusted_close !== null ? data.adjusted_close : stockPrice.adjusted_close
        });
      }

      return stockPrice;
    } catch (error) {
      console.error(`Error updating/creating stock price for ${data.ticker}:`, error);
      throw error;
    }
  }

  static async processHistoricalBatch(companies, startDate) {
    const results = [];
    console.log(`Processing historical batch of ${companies.length} companies`);
    
    for (const company of companies) {
      try {
        console.log(`\nProcessing historical data for ${company.ticker}`);
        
        const queryOptions = {  
          period1: startDate,
          period2: new Date(),
          interval: '1d'
        };

        await this.sleep(2000); // 2 second delay between each stock
        const historicalData = await this.fetchWithRetry(company.ticker, queryOptions);
        let processedCount = 0;
        let errorCount = 0;

        for (const data of historicalData) {
          try {
            const result = await this.updateOrCreateStockPrice({
              ticker: company.ticker,
              date: data.date,
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
              volume: data.volume,
              adjusted_close: data.adjClose
            });
            
            if (result) {
              processedCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error(`Error processing data point for ${company.ticker} at ${data.date}:`, error);
            errorCount++;
            continue;
          }
        }

        results.push({
          success: true,
          ticker: company.ticker,
          recordsProcessed: processedCount,
          recordsError: errorCount
        });
        console.log(`Processed ${processedCount} records (${errorCount} errors) for ${company.ticker}`);
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

      console.log(`Found ${companies.length} active companies to process`);

      const threeYearsAgo = new Date();  
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);  

      const results = {  
        success: 0,
        failed: 0,
        totalRecordsProcessed: 0,
        totalRecordsError: 0,
        errors: [],
        timestamp: new Date()
      };  

      // Process in smaller batches
      const batchSize = 5; // Reduced batch size
      const totalBatches = Math.ceil(companies.length/batchSize);
      
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        const currentBatch = Math.floor(i/batchSize) + 1;
        console.log(`\nProcessing batch ${currentBatch} of ${totalBatches}`);
        
        const batchResults = await this.processHistoricalBatch(batch, threeYearsAgo);
        
        // Process results
        batchResults.forEach(result => {
          if (result.success) {
            results.success++;
            results.totalRecordsProcessed += result.recordsProcessed;
            if (result.recordsError) {
              results.totalRecordsError += result.recordsError;
            }
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

        // Longer delay between batches
        if (i + batchSize < companies.length) {
          const waitTime = 15000; // 15 second delay between batches
          console.log(`Waiting ${waitTime/1000} seconds between batches...`);
          await this.sleep(waitTime);
        }
      }

      console.log('\nFinal Results:', {
        companiesProcessed: results.success,
        companiesFailed: results.failed,
        totalRecordsProcessed: results.totalRecordsProcessed,
        totalRecordsError: results.totalRecordsError
      });

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
    const results = [];
    for (const company of companies) {
      try {
        console.log(`Fetching daily data for ${company.ticker}`);
        const quote = await yahooFinance.quote(company.ticker);
        
        if (!quote) {
          console.warn(`No quote data returned for ${company.ticker}`);
          results.push({ success: false, ticker: company.ticker, error: 'No quote data returned' });
          continue;
        }

        if (!quote.regularMarketPrice) {
          console.warn(`No market price available for ${company.ticker}`);
          results.push({ success: false, ticker: company.ticker, error: 'No market price available' });
          continue;
        }

        const result = await this.updateOrCreateStockPrice({
          ticker: company.ticker,
          date: today,
          open: quote.regularMarketOpen,
          high: quote.regularMarketDayHigh,
          low: quote.regularMarketDayLow,
          close: quote.regularMarketPrice,
          volume: quote.regularMarketVolume,
          adjusted_close: quote.regularMarketPrice
        });

        results.push({ 
          success: true, 
          ticker: company.ticker,
          price: quote.regularMarketPrice
        });
        
        console.log(`Successfully updated daily price for ${company.ticker}: $${quote.regularMarketPrice}`);
        
      } catch (error) {
        console.error(`Error processing daily price for ${company.ticker}:`, error);
        results.push({ 
          success: false, 
          ticker: company.ticker, 
          error: error.message 
        });
      }
      
      // Small delay between each company
      await this.sleep(1000);
    }
    return results;
  }

  static async updateDailyPrices() {  
    try {  
      const companies = await db.Company.findAll({  
        where: { active: true },  
        attributes: ['ticker']  
      });  

      console.log(`Found ${companies.length} active companies to update daily prices`);

      const today = new Date();  
      today.setHours(0, 0, 0, 0);  

      const results = {  
        success: 0,  
        failed: 0,  
        errors: [],
        timestamp: new Date()
      };  

      // Process in smaller batches
      const batchSize = 10; // Reduced batch size for better rate limiting
      const totalBatches = Math.ceil(companies.length/batchSize);
      
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        const currentBatch = Math.floor(i/batchSize) + 1;
        console.log(`\nProcessing daily price batch ${currentBatch} of ${totalBatches}`);
        
        const batchResults = await this.processDailyPriceBatch(batch, today);
        
        // Process results
        batchResults.forEach(result => {
          if (result.success) {
            results.success++;
            if (result.price) {
              console.log(`Updated ${result.ticker} price: $${result.price}`);
            }
          } else {
            results.failed++;
            results.errors.push({
              ticker: result.ticker,
              error: result.error
            });
            console.error(`Failed to update ${result.ticker}: ${result.error}`);
          }
        });

        // Delay between batches
        if (i + batchSize < companies.length) {
          const waitTime = 5000; // 5 second delay between batches
          console.log(`Waiting ${waitTime/1000} seconds between batches...`);
          await this.sleep(waitTime);
        }
      }

      console.log('\nFinal Results:', {
        companiesProcessed: results.success,
        companiesFailed: results.failed
      });

      return results;  
    } catch (error) {  
      console.error('Error updating daily prices:', error);  
      throw error;  
    }  
  }  
}  

module.exports = StockPriceService;
