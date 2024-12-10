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

  static async fetchStockQuoteWithFallback(ticker) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://finance.yahoo.com/'
    };

    try {
      // First, try the library's quote method
      const libraryQuote = await yahooFinance.quote(ticker);
      if (libraryQuote && libraryQuote.regularMarketPrice) {
        return libraryQuote;
      }

      // Fallback to direct fetch if library method fails
      console.log(`[${ticker}] Falling back to direct fetch`);
      const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`, { 
        headers 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract quote from response
      const quotes = data.quoteResponse?.result || [];
      if (quotes.length > 0) {
        return quotes[0];
      }

      throw new Error('No quote data found');
    } catch (error) {
      console.error(`[${ticker}] Quote fetch error:`, error);
      throw error;
    }
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
          quote = await this.fetchStockQuoteWithFallback(company.ticker);
        } catch (fetchError) {
          console.error(`[${company.ticker}] Fetch error:`, fetchError);
          results.push({ 
            success: false, 
            ticker: company.ticker, 
            error: fetchError.message 
          });
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

  // Rest of the class remains unchanged
}  

module.exports = StockPriceService;
