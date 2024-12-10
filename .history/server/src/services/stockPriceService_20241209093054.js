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

  static async processDailyPriceBatch(companies, today) {
    const results = [];
    for (const company of companies) {
      try {
        console.log(`[${company.ticker}] Fetching daily data`);
        
        // Add delay before each request
        await this.sleep(2000);
        
        // Add more robust error handling and logging
        const quoteOptions = {
          // Add more specific options to handle potential API issues
          validateResult: false,  // Disable internal validation
          timeout: 10000  // 10-second timeout
        };

        let quote;
        try {
          quote = await yahooFinance.quote(company.ticker, quoteOptions);
        } catch (fetchError) {
          console.error(`[${company.ticker}] Fetch error:`, fetchError);
          
          // Check for specific error types
          if (fetchError.message.includes('invalid json')) {
            console.warn(`[${company.ticker}] Potential JSON parsing issue. Retrying with alternative method.`);
            
            // Alternative fetch method
            try {
              quote = await yahooFinance.quoteSummary(company.ticker);
            } catch (fallbackError) {
              console.error(`[${company.ticker}] Fallback fetch failed:`, fallbackError);
              results.push({ 
                success: false, 
                ticker: company.ticker, 
                error: `Fetch failed: ${fallbackError.message}` 
              });
              continue;
            }
          } else {
            results.push({ 
              success: false, 
              ticker: company.ticker, 
              error: `Fetch failed: ${fetchError.message}` 
            });
            continue;
          }
        }

        // Extensive validation of quote data
        if (!quote) {
          console.warn(`[${company.ticker}] No quote data returned`);
          results.push({ success: false, ticker: company.ticker, error: 'No quote data returned' });
          continue;
        }

        // More flexible price extraction
        const price = 
          quote.regularMarketPrice || 
          quote.price || 
          quote.currentPrice || 
          quote.financialData?.currentPrice;

        if (!price) {
          console.warn(`[${company.ticker}] No market price available`, quote);
          results.push({ success: false, ticker: company.ticker, error: 'No market price available', rawQuote: JSON.stringify(quote) });
          continue;
        }

        const result = await this.updateOrCreateStockPrice({
          ticker: company.ticker,
          date: today,
          open: quote.regularMarketOpen || quote.openPrice,
          high: quote.regularMarketDayHigh || quote.dayHigh,
          low: quote.regularMarketDayLow || quote.dayLow,
          close: price,
          volume: quote.regularMarketVolume || quote.volume,
          adjusted_close: price
        });

        results.push({ 
          success: true, 
          ticker: company.ticker,
          price: price
        });
        
        console.log(`[${company.ticker}] Updated daily price: $${price}`);
        
      } catch (error) {
        console.error(`[${company.ticker}] Unexpected error processing daily price:`, error);
        results.push({ 
          success: false, 
          ticker: company.ticker, 
          error: error.message 
        });
      }
    }
    return results;
  }

  // Rest of the class remains the same...
}  

module.exports = StockPriceService;
