// src/jobs/watchlistJob.js
const cron = require('node-cron');

const initializeWatchlistJob = () => {
    // Schedule watchlist updates - adjust schedule as needed
    cron.schedule('*/15 9-16 * * 1-5', async () => {
        console.log('Running scheduled watchlist update...');
        try {
            // TODO: Implement watchlist update logic
            console.log('Watchlist update completed');
        } catch (error) {
            console.error('Failed to update watchlists:', error);
        }
    }, {
        timezone: "America/New_York"
    });
};

module.exports = {
    initializeWatchlistJob
};
