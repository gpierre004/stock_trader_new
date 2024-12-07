// src/app.js  
require('dotenv').config();  
const express = require('express');  
const cors = require('cors');  
const helmet = require('helmet');  
const rateLimit = require('express-rate-limit');  
const cron = require('node-cron');  
const routes = require('./routes/index.js');  // Updated path  
const { sequelize, testConnection } = require('./models');  // Updated path  
const stockController = require('./controllers/stockController');  // Updated path  
const watchlistController = require('./controllers/watchlistController');  // Updated path  
const CompanyService = require('./services/companyService');  // Updated path  

const app = express();  
app.use('/api', routes);


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