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
      console.log(`[${ticker}] Initiating data fetch with options:`, queryOptions);
      
      // Add delay before each request to avoid rate limiting
      await this.sleep(3000);
      
      const result = await yahooFinance.chart(ticker, queryOptions);
      
      if (!result) {
        console.warn(`[${ticker}] Yahoo Finance returned null/undefined result`);
        return [];
      }

      if (!result.quotes) {
        console.warn(`[${ticker}] Yahoo Finance result missing quotes array`);
        return [];
      }

      console.log(`[${ticker}] Successfully fetched ${result.quotes.length} raw quotes`);
      
      const validQuotes = result.quotes
        .filter(quote => {
          if (!quote) {
            console.warn(`[${ticker}] Skipping null/undefined quote`);
            return false;
          }

          let date;
          // Handle both timestamp and date fields
          if (quote.timestamp) {
            date = new Date(quote.timestamp * 1000);
          } else if (quote.date) {
            date = new Date(quote.date);
          } else {
            console.warn(`[${ticker}] Quote missing both timestamp and date:`, JSON.stringify(quote));
            return false;
          }

          // Validate the date
          if (isNaN(date.getTime())) {
            console.warn(`[${ticker}] Invalid date: ${date}`);
            return false;
          }

          // Ensure the date falls within our query period
          if (date < queryOptions.period1 || date > queryOptions.period2) {
            console.warn(`[${ticker}] Quote date ${date.toISOString()} outside query period`);
            return false;
          }

          if (!quote.close && !quote.adjclose) {
            console.warn(`[${ticker}] Missing price data for ${date.toISOString()}`);
            return false;
          }

          return true;
        })
        .map(quote => {
          // Use either timestamp or date field
          const date = quote.timestamp ? 
            new Date(quote.timestamp * 1000) : 
            new Date(quote.date);

          return {
            date,
            open: quote.open || null,
            high: quote.high || null,
            low: quote.low || null,
            close: quote.close || null,
            volume: quote.volume || null,
            adjClose: quote.adjclose || quote.close || null
          };
        });

      const invalidCount = result.quotes.length - validQuotes.length;
      console.log(`[${ticker}] Processed ${validQuotes.length} valid quotes (${invalidCount} invalid) out of ${result.quotes.length} total`);
      
      if (validQuotes.length === 0) {
        console.warn(`[${ticker}] No valid quotes found after filtering`);
      }

      return validQuotes;

    } catch (error) {
      console.error(`[${ticker}] Error fetching data:`, error.message);
      
      const retryableErrors = [
        'Too Many Requests',
        'not valid JSON',
        'timeout',
        'socket hang up',
        'ECONNRESET',
        'EAI_AGAIN'
      ];

      const shouldRetry = retryableErrors.some(msg => error.message.includes(msg));
      
      if (shouldRetry && retryCount < 3) {
        const waitTime = Math.pow(2, retryCount) * 60000; // Increased to 1-minute base wait time
        console.log(`[${ticker}] Will retry in ${waitTime/1000} seconds (Attempt ${retryCount + 1}/3)`);
        await this.sleep(waitTime);
        return this.fetchWithRetry(ticker, queryOptions, retryCount + 1);
      }

      throw error;
    }
  }

  // Rest of the class implementation remains unchanged
  static async updateOrCreateStockPrice(data) {
    try {
      if (!data.ticker || !data.date) {
        console.warn('Missing required data:', { ticker: data.ticker, date: data.date });
        return null;
      }

      if (isNaN(data.date.getTime())) {
        console.warn(`Invalid date for ticker ${data.ticker}: ${data.date}`);
        return null;
      }

      console.log(`[${data.ticker}] Updating/creating price for ${data.date.toISOString()}`);

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
          adjusted_close: data.adjusted_close || data.adjClose
        }
      });

      if (!created) {
        await stockPrice.update({
          open: data.open !== null ? data.open : stockPrice.open,
          high: data.high !== null ? data.high : stockPrice.high,
          low: data.low !== null ? data.low : stockPrice.low,
          close: data.close !== null ? data.close : stockPrice.close,
          volume: data.volume !== null ? data.volume : stockPrice.volume,
          adjusted_close: (data.adjusted_close || data.adjClose) !== null ? 
            (data.adjusted_close || data.adjClose) : stockPrice.adjusted_close
        });
        console.log(`[${data.ticker}] Updated existing price record for ${data.date.toISOString()}`);
      } else {
        console.log(`[${data.ticker}] Created new price record for ${data.date.toISOString()}`);
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
    
    // Process one company at a time
    for (const company of companies) {
      try {
        console.log(`\nProcessing historical data for ${company.ticker}`);
        
        const queryOptions = {  
          period1: startDate,
          period2: new Date(),
          interval: '1d'
        };

        console.log(`[${company.ticker}] Query options:`, queryOptions);

        const historicalData = await this.fetchWithRetry(company.ticker, queryOptions);
        let processedCount = 0;
        let errorCount = 0;

        console.log(`[${company.ticker}] Processing ${historicalData.length} historical records`);

        // Process data points with small delays between each
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
              adjClose: data.adjClose
            });
            
            if (result) {
              processedCount++;
              if (processedCount % 50 === 0) {
                // Add small delay every 50 records
                await this.sleep(1000);
              }
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error(`[${company.ticker}] Error processing data point for ${data.date}:`, error);
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
        console.log(`[${company.ticker}] Completed: ${processedCount} processed, ${errorCount} errors`);
        
        // Add longer delay between companies
        await this.sleep(5000);
      } catch (error) {
        console.error(`[${company.ticker}] Failed to process historical data:`, error);
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
      console.log('Starting historical data update for all companies');
      
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

      // Process in very small batches
      const batchSize = 2; // Reduced to just 2 companies per batch
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
          const waitTime = 30000; // Increased to 30 seconds between batches
          console.log(`Waiting ${waitTime/1000} seconds between batches...`);
          await this.sleep(waitTime);
        }
      }

      console.log('\nFinal Results:', {
        companiesProcessed: results.success,
        companiesFailed: results.failed,
        totalRecordsProcessed: results.totalRecordsProcessed,
        totalRecordsError: results.totalRecordsError,
        errors: results.errors
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
        console.log(`[${company.ticker}] Fetching daily data`);
        
        // Add delay before each request
        await this.sleep(2000);
        
        const quote = await yahooFinance.quote(company.ticker);
        
        if (!quote) {
          console.warn(`[${company.ticker}] No quote data returned`);
          results.push({ success: false, ticker: company.ticker, error: 'No quote data returned' });
          continue;
        }

        if (!quote.regularMarketPrice) {
          console.warn(`[${company.ticker}] No market price available`);
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
        
        console.log(`[${company.ticker}] Updated daily price: $${quote.regularMarketPrice}`);
        
      } catch (error) {
        console.error(`[${company.ticker}] Error processing daily price:`, error);
        results.push({ 
          success: false, 
          ticker: company.ticker, 
          error: error.message 
        });
      }
    }
    return results;
  }

  static async updateDailyPrices() {  
    try {  
      console.log('Starting daily price update for all companies');
      
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
      const batchSize = 5; // Reduced batch size
      const totalBatches = Math.ceil(companies.length/batchSize);
      
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        const currentBatch = Math.floor(i/batchSize) + 1;
        console.log(`\nProcessing daily price batch ${currentBatch} of ${totalBatches}`);
        
        const batchResults = await this.processDailyPriceBatch(batch, today);
        
        batchResults.forEach(result => {
          if (result.success) {
            results.success++;
            console.log(`Updated ${result.ticker} price: $${result.price}`);
          } else {
            results.failed++;
            results.errors.push({
              ticker: result.ticker,
              error: result.error
            });
            console.error(`Failed to update ${result.ticker}: ${result.error}`);
          }
        });

        // Longer delay between batches
        if (i + batchSize < companies.length) {
          const waitTime = 10000; // Increased to 10 seconds between batches
          console.log(`Waiting ${waitTime/1000} seconds between batches...`);
          await this.sleep(waitTime);
        }
      }

      console.log('\nFinal Results:', {
        companiesProcessed: results.success,
        companiesFailed: results.failed,
        errors: results.errors
      });

      return results;  
    } catch (error) {  
      console.error('Error updating daily prices:', error);  
      throw error;  
    }  
  }  
}  

module.exports = StockPriceService;
