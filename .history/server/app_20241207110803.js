// app.js  
const CompanyService = require('./services/companyService');  

// Add this with your other cron jobs  
cron.schedule('0 0 * * 1', async () => {  
    // Runs at midnight every Monday  
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