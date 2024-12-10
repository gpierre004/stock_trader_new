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
        
        let quote;
        try {
          quote = await yahooFinance.quote(company.ticker);
        } catch (error) {
          // Log detailed error information
          console.error(`[${company.ticker}] Quote fetch error:`, {
            message: error.message,
            name: error.name,
            stack: error.stack
          });

          // Attempt to fetch raw response for debugging
          try {
            const rawResponse = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${company.ticker}`);
            const rawText = await rawResponse.text();
            console.log(`[${company.ticker}] Raw API Response:`, rawText);
          } catch (fetchError) {
            console.error(`[${company.ticker}] Raw fetch error:`, fetchError);
          }

          results.push({ 
            success: false, 
            ticker: company.ticker, 
            error: error.message 
          });
          continue;
        }

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
