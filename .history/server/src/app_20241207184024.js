// src/app.js  
require('dotenv').config();  
const express = require('express');  
const cors = require('cors');  
const helmet = require('helmet');  
const rateLimit = require('express-rate-limit');  
const routes = require('./routes/index.js');  
const { sequelize, testConnection } = require('./models');  
const errorHandler = require('./middleware/errorHandler');
const MarketDataJobs = require('./jobs/marketDataJobs');  
const watchlistController = require('./controllers/watchlistController');
const cronJobs = require('./jobs/cronJobs');

const app = express();  

// Security and parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

const startServer = async () => {  
    const PORT = process.env.PORT || 3001;    
    
    try {  
        // Test database connection and sync models
        await testConnection();  
        await sequelize.sync({ 
            alter: {  
                drop: false  
            }  
        });  
        console.log('Database connection established and models synchronized');  
        
        // Initialize scheduled jobs
        MarketDataJobs.initializeJobs();  
        watchlistController.initializeWatchlistCron();
        cronJobs.initializeJobs();

        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`API endpoints available at http://localhost:${PORT}/api`);
            console.log('Market data updates scheduled for weekdays 9:30 AM - 4:00 PM ET');
        });
    } catch (error) {  
        console.error('Failed to start server:', error);  
        process.exit(1);  
    }  
};

// Export for testing
module.exports = { app, startServer };
