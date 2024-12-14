const MarketDataJobs = require('../jobs/marketDataJobs');
const { initializeWatchlistJob } = require('../jobs/watchlistJob');
const MaintenanceService = require('../services/maintenanceService');

exports.updateMarketData = async (req, res) => {
    try {
        await MarketDataJobs.updateMarketData();
        res.json({ message: 'Market data update initiated successfully' });
    } catch (error) {
        console.error('Error updating market data:', error);
        res.status(500).json({ error: 'Failed to update market data' });
    }
};

exports.updateWatchlist = async (req, res) => {
    try {
        await initializeWatchlistJob();
        res.json({ message: 'Watchlist update initiated successfully' });
    } catch (error) {
        console.error('Error updating watchlist:', error);
        res.status(500).json({ error: 'Failed to update watchlist' });
    }
};

exports.syncMissingCompanies = async (req, res) => {
    try {
        // Get unique tickers from transactions that don't exist in companies
        const [missingTickers] = await sequelize.query(`
            SELECT DISTINCT t.ticker 
            FROM transactions t 
            LEFT JOIN companies c ON t.ticker = c.ticker 
            WHERE c.ticker IS NULL
        `);

        if (missingTickers.length === 0) {
            return res.json({ message: 'No missing companies found' });
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

        res.json({ 
            message: 'Missing companies synced successfully',
            inserted: companiesToInsert.length,
            tickers: companiesToInsert.map(c => c.ticker)
        });
    } catch (error) {
        console.error('Error syncing missing companies:', error);
        res.status(500).json({ error: 'Failed to sync missing companies' });
    }
};
