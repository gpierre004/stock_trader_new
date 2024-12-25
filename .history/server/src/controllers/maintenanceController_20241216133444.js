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
        const result = await MaintenanceService.syncMissingCompanies();
        res.json({ 
            message: 'Missing companies synced successfully',
            ...result
        });
    } catch (error) {
        console.error('Error syncing missing companies:', error);
        res.status(500).json({ error: 'Failed to sync missing companies' });
    }
};

exports.updateFullStockHistory = async (req, res) => {
    try {
        const result = await MaintenanceService.updateFullStockHistory();
        res.json({ 
            message: 'Full stock history update completed successfully',
            ...result
        });
    } catch (error) {
        console.error('Error updating full stock history:', error);
        res.status(500).json({ error: 'Failed to update full stock history' });
    }
};
