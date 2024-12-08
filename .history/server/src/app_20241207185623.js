// src/app.js  
require('dotenv').config();  
const express = require('express');  
const cors = require('cors');  
const helmet = require('helmet');  
const rateLimit = require('express-rate-limit');  
const routes = require('./routes/index.js');  
const { sequelize } = require('./models');  
const stockController = require('./controllers/stockController');  
const watchlistController = require('./controllers/watchlistController');  
const MarketDataJobs = require('./jobs/marketDataJobs');  
const { initializeCompanyUpdateJob } = require('./jobs/companyUpdateJob');
const { initializeWatchlistJob } = require('./jobs/watchlistJob');
const StockPriceJobs = require('./jobs/stockPriceJobs');

// Suppress punycode deprecation warning
process.noDeprecation = true;

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

const startServer = async () => {  
    const PORT = process.env.PORT || 3001;    
    try {  
        // Test database connection  
        await sequelize.authenticate();
        console.log('Database connection established successfully');
        
        // Sync database models  
        await sequelize.sync({   
            alter: {  
                drop: false  
            }  
        });  
        console.log('Database models synchronized');
        
        // Initialize all cron jobs  
        MarketDataJobs.initializeJobs();  
        initializeWatchlistJob();
        initializeCompanyUpdateJob();

        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(`🔌 API endpoints: http://localhost:${PORT}/api`);
            console.log('📊 Market data updates: weekdays 9:30 AM - 4:00 PM ET');
            console.log('=================================');
        });
    } catch (error) {  
        console.error('Failed to start server:', error);  
        process.exit(1);  
    }  
};

// Start the server
startServer();

module.exports = app;
