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
        
        // Special handling for AXP to diagnose the issue
        if (company.ticker === 'AXP') {
          try {
            console.log('[AXP] Attempting to fetch quote with verbose logging');
            const rawResponse = await fetch(`https://query2.finance.yahoo.com/v7/finance/quote?symbols=AXP&crumb=4lmdtrXaiAp`);
            const responseText = await rawResponse.text();
            console.log('[AXP] Raw API Response:', responseText);
          } catch (axpError) {
            console.error('[AXP] Raw fetch error:', axpError);
          }
        }
        
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

  // Rest of the class remains unchanged
}  

module.exports = StockPriceService;
