const cron = require('node-cron');
const MaintenanceService = require('../services/maintenanceService');
const logger = require('../utils/logger');

class MaintenanceJobs {
    static initializeJobs() {
        // Run company sync daily at midnight
        cron.schedule('0 0 * * *', async () => {
            logger.info('Starting daily company sync maintenance...');
            try {
                const result = await MaintenanceService.syncMissingCompanies();
                logger.info('Daily company sync completed:', result);
            } catch (error) {
                logger.error('Failed to sync companies:', error);
            }
        }, {
            timezone: "America/New_York",
            immediate: false  // Prevent immediate execution at startup
        });
    }
}

module.exports = MaintenanceJobs;
