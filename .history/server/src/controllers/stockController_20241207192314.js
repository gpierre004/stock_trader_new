// src/controllers/stockController.js
const CompanyService = require('../services/companyService');
const MarketMoverService = require('../services/marketMoverService');
const StockPriceService = require('../services/stockPriceService');

const stockController = {
    getQuote: async (req, res) => {
        try {
            const { symbol } = req.params;
            // TODO: Implement get quote
            res.status(501).json({ message: 'Get quote not implemented yet', symbol });
        } catch (error) {
            console.error('Error in getQuote:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getHistoricalData: async (req, res) => {
        try {
            const { symbol } = req.params;
            // TODO: Implement historical data
            res.status(501).json({ message: 'Historical data not implemented yet', symbol });
        } catch (error) {
            console.error('Error in getHistoricalData:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getMarketMovers: async (req, res) => {
        try {
            const marketMovers = await MarketMoverService.getTopMovers();
            res.json(marketMovers);
        } catch (error) {
            console.error('Error in getMarketMovers:', error);
            res.status(500).json({ error: error.message });
        }
    },

    searchStocks: async (req, res) => {
        try {
            const { query } = req.query;
            // TODO: Implement stock search
            res.status(501).json({ message: 'Stock search not implemented yet', query });
        } catch (error) {
            console.error('Error in searchStocks:', error);
            res.status(500).json({ error: error.message });
        }
    },

    refreshCompanies: async (req, res) => {
        try {
            const result = await CompanyService.refreshSP500List();
            res.json({
                message: 'Successfully refreshed S&P 500 companies',
                stats: result
            });
        } catch (error) {
            console.error('Error in refreshCompanies:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getActiveCompanies: async (req, res) => {
        try {
            const companies = await CompanyService.getActiveCompanies();
            res.json(companies);
        } catch (error) {
            console.error('Error in getActiveCompanies:', error);
            res.status(500).json({ error: error.message });
        }
    },

    updateCompany: async (req, res) => {
        try {
            const { ticker } = req.params;
            const companyData = req.body;
            
            const updatedCompany = await CompanyService.updateCompany(ticker, companyData);
            res.json({
                message: 'Company updated successfully',
                company: updatedCompany
            });
        } catch (error) {
            console.error('Error in updateCompany:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // New method for manual market data update
    updateMarketData: async (req, res) => {
        try {
            // Perform stock price update
            const stockPriceUpdateResult = await StockPriceService.updateStockPrices();
            
            // Calculate market movers
            const marketMoversResult = await MarketMoverService.calculateMarketMovers();

            res.json({
                message: 'Market data updated successfully',
                stockPriceUpdate: stockPriceUpdateResult,
                marketMoversUpdate: marketMoversResult
            });
        } catch (error) {
            console.error('Error updating market data:', error);
            res.status(500).json({ 
                message: 'Failed to update market data', 
                error: error.message 
            });
        }
    }
};

module.exports = stockController;
