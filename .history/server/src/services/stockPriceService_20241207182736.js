// src/services/stockPriceService.js  
const yahooFinance = require('yahoo-finance2');  
const { StockPrice, Company } = require('../models');  
const { Op } = require('sequelize');  

class StockPriceService {  
    static async updateStockPrices() {  
        try {  
            const companies = await Company.findAll({  
                where: { active: true },  
                attributes: ['ticker'],  
                raw: true  
            });  

            const results = {  
                success: 0,  
                failed: 0,  
                errors: []  
            };  

            for (const company of companies) {  
                try {  
                    const quote = await yahooFinance.quote(company.ticker);  

                    await StockPrice.create({  
                        ticker: company.ticker,  
                        date: new Date(),  
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
            console.error('Error updating stock prices:', error);  
            throw error;  
        }  
    }  

    static async getLatestPrices(tickers = null) {  
        try {  
            const where = tickers ? { ticker: { [Op.in]: tickers } } : {};  

            return await StockPrice.findAll({  
                where,  
                attributes: [  
                    'ticker',  
                    [sequelize.fn('MAX', sequelize.col('date')), 'date']  
                ],  
                group: ['ticker'],  
                raw: true  
            });  
        } catch (error) {  
            console.error('Error fetching latest prices:', error);  
            throw error;  
        }  
    }  
}  

module.exports = StockPriceService;  