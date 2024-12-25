const { sequelize, Company } = require('../models');
const logger = require('../utils/logger');
const StockPriceService = require('./stockPriceService');

class MaintenanceService {
    static async syncMissingCompanies() {
        try {
            // Get unique tickers from transactions that don't exist in companies
            const [missingTickers] = await sequelize.query(`
                SELECT DISTINCT t.ticker 
                FROM transactions t 
                LEFT JOIN companies c ON t.ticker = c.ticker 
                WHERE c.ticker IS NULL
            `);

            if (missingTickers.length === 0) {
                logger.info('No missing companies found during sync');
                return { inserted: 0, tickers: [] };
            }

            // Insert missing tickers into companies table
            const companiesToInsert = missingTickers.map(({ ticker }) => ({
                ticker,
                name: ticker, // Using ticker as name temporarily
                active: true,
                created_at: new Date(),
                updated_at: new Date()
            }));

            await Company.bulkCreate(companiesToInsert);

            const result = {
                inserted: companiesToInsert.length,
                tickers: companiesToInsert.map(c => c.ticker)
            };

            logger.info('Successfully synced missing companies:', result);
            return result;
        } catch (error) {
            logger.error('Error syncing missing companies:', error);
            throw error;
        }
    }

    static async updateFullStockHistory() {
        try {
            logger.info('Starting full stock price history update...');
            const result = await StockPriceService.updateHistoricalDataForAllCompanies();
            logger.info('Full stock price history update completed:', result);
            return {
                updated: result.updated || 0,
                message: 'Full stock price history update completed successfully'
            };
        } catch (error) {
            logger.error('Error updating full stock price history:', error);
            throw error;
        }
    }
}

module.exports = MaintenanceService;
