const yahooFinance = require('yahoo-finance2').default;  
const db = require('../models');
const { Op } = require('sequelize');  
const fetch = require('node-fetch');

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
        
        // Attempt to fetch quote with additional error handling
        let quote;
        try {
          // First, try standard library method
          quote = await yahooFinance.quote(company.ticker);
          
          // If quote is null or undefined, throw an error
          if (!quote) {
            throw new Error('No quote data returned');
          }
        } catch (libraryError) {
          console.warn(`[${company.ticker}] Library quote fetch failed:`, libraryError.message);
          
          // Fallback to direct fetch with detailed logging
          try {
            const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${company.ticker}`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
              }
            });

            // Log raw response for debugging
            const responseText = await response.text();
            console.log(`[${company.ticker}] Raw API Response:`, responseText);

            // Attempt to parse JSON
            const data = JSON.parse(responseText);
            const quotes = data.quoteResponse?.result || [];
            
            if (quotes.length === 0) {
              throw new Error('No quotes found in response');
            }

            quote = quotes[0];
          } catch (fetchError) {
            console.error(`[${company.ticker}] Fetch error:`, fetchError);
            results.push({ 
              success: false, 
              ticker: company.ticker, 
              error: fetchError.message 
            });
            continue;
          }
        }

        // Validate quote data
        if (!quote.regularMarketPrice) {
          console.warn(`[${company.ticker}] No market price available`);
          results.push({ 
            success: false, 
            ticker: company.ticker, 
            error: 'No market price available',
            rawQuote: JSON.stringify(quote)
          });
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

  // Rest of the class remains unchanged
}  

module.exports = StockPriceService;
