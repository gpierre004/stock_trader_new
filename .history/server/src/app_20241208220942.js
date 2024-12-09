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
const WebSocket = require('ws');
const http = require('http');

// Suppress punycode deprecation warning
process.noDeprecation = true;

const app = express();  

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
        console.log('Received:', message);
        // Handle incoming messages
        try {
            const data = JSON.parse(message);
            // Handle different message types
            switch(data.type) {
                case 'subscribe':
                    // Handle subscription
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('WebSocket message handling error:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connection established' }));
});

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

// Routes
app.use('/api', routes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
    
    // Send appropriate error response
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : err.message
    });
});

const startServer = async () => {  
    const PORT = process.env.PORT || 3001;    
    try {  
        // Test database connection with detailed error logging
        await sequelize.authenticate({
            logging: console.log
        }).catch(error => {
            console.error('Database authentication error:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        });
        console.log('Database connection established successfully');
        
        // Sync database models with detailed error logging
        await sequelize.sync({   
            alter: {  
                drop: false  
            },
            logging: console.log
        }).catch(error => {
            console.error('Database sync error:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        });  
        console.log('Database models synchronized');
        
        // Initialize all cron jobs  
        MarketDataJobs.initializeJobs();  
        initializeWatchlistJob();
        initializeCompanyUpdateJob();
        StockPriceJobs.initializeJobs();

        // Use HTTP server instead of Express app to support WebSocket
        server.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(`🔌 API endpoints: http://localhost:${PORT}/api`);
            console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws`);
            console.log('📊 Market data updates: weekdays 9:30 AM - 4:00 PM ET');
            console.log('=================================');
        });
    } catch (error) {  
        console.error('Failed to start server:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });  
        process.exit(1);  
    }  
};

// Start the server
startServer();

module.exports = app;
