const MarketDataJobs = require('../jobs/marketDataJobs');
const { initializeWatchlistJob } = require('../jobs/watchlistJob');

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
