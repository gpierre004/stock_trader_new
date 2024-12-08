// src/app.js  
require('dotenv').config();  
const express = require('express');  
const cors = require('cors');  
const helmet = require('helmet');  
const rateLimit = require('express-rate-limit');  
const cron = require('node-cron');  
const routes = require('./routes/index.js');  
const { sequelize, testConnection } = require('./models');  
const stockController = require('./controllers/stockController');  
const watchlistController = require('./controllers/watchlistController');  
const CompanyService = require('./services/companyService');
const MarketDataJobs = require('./jobs/marketDataJobs');  

const app = express();  

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
    console.log('Market data updates scheduled for weekdays 9:30 AM - 4:00 PM ET');
});

module.exports = app;
