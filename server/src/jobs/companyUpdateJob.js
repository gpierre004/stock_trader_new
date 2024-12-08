// src/jobs/companyUpdateJob.js
const cron = require('node-cron');
const CompanyService = require('../services/companyService');

const initializeCompanyUpdateJob = () => {
    // Runs at midnight every Monday
    cron.schedule('0 0 * * 1', async () => {
        console.log('Running scheduled S&P 500 companies update...');
        try {
            const result = await CompanyService.refreshSP500List();
            console.log('S&P 500 companies update completed:', result);
        } catch (error) {
            console.error('Failed to update S&P 500 companies:', error);
        }
    }, {
        timezone: "America/New_York"
    });
};

module.exports = {
    initializeCompanyUpdateJob
};
