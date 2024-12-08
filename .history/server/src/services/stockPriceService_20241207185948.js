const yahooFinance = require('yahoo-finance2').default;  
const { StockPrice, Company } = require('../models');  
const { Op } = require('sequelize');  

class StockPriceService {  
  static async fetchAndUpdateHistoricalData(ticker, startDate) {  
    try {  
      const queryOptions = {  
        period1: startDate,
        period2: new Date(),
        interval: '1d'
      };  

      // Using the correct method for yahoo-finance2
      const result = await yahooFinance.search(ticker);
      const symbol = result.quotes[0]?.symbol || ticker;
      const historicalData = await yahooFinance.historical(symbol, queryOptions);

      // Process each historical data point  
      for (const data of historicalData) {  
        await StockPrice.upsert({  
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
      console.error(`Error fetching historical data for ${ticker}:`, error);  
      throw error;  
    }  
  }  

  static async updateHistoricalDataForAllCompanies() {  
    try {  
      const companies = await Company.findAll({  
        where: { active: true },  
        attributes: ['ticker']  
      });  

      const threeYearsAgo = new Date();  
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);  

      const results = {  
        success: 0,  
        failed: 0,  
        errors: []  
      };  

      for (const company of companies) {  
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

      return results;  
    } catch (error) {  
      console.error('Error updating historical data:', error);  
      throw error;  
    }  
  }  

  static async updateDailyPrices() {  
    try {  
      const companies = await Company.findAll({  
        where: { active: true },  
        attributes: ['ticker']  
      });  

      const today = new Date();  
      today.setHours(0, 0, 0, 0);  

      const results = {  
        success: 0,  
        failed: 0,  
        errors: []  
      };  

      for (const company of companies) {  
        try {  
          const quote = await yahooFinance.quote(company.ticker);  

          await StockPrice.upsert({  
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

      return results;  
    } catch (error) {  
      console.error('Error updating daily prices:', error);  
      throw error;  
    }  
  }  
}  

module.exports = StockPriceService;
