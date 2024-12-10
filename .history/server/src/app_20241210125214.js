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
const WebSocket = require('ws');
const http = require('http');

// Suppress punycode deprecation warning
process.noDeprecation = true;

const app = express();  

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server with ping/pong
const wss = new WebSocket.Server({ 
    server, 
    path: '/ws',
    clientTracking: true 
});

// Store WebSocket server in app.locals for access in controllers
app.locals.wss = wss;

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    ws.isAlive = true;

    // Setup ping-pong
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established'
    }));

    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        try {
            const data = JSON.parse(message);
            // Handle different message types
            switch(data.type) {
                case 'subscribe':
                    console.log('Client subscribed to:', data.topic);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('WebSocket message handling error:', error);
            // Send error back to client
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to process message'
            }));
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        ws.isAlive = false;
    });
});

// Heartbeat interval to check connection status
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            console.log('Terminating inactive WebSocket connection');
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000); // Check every 30 seconds

wss.on('close', () => {
    clearInterval(interval);
});

// Security middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
    const errorDetails = {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        body: req.body
    };
    
    console.error('Error details:', errorDetails);
    
    // Send appropriate error response
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : errorDetails.message
    });
});

const startServer = async () => {  
    const PORT = process.env.PORT || 3001;    
    try {  
        // Test database connection without logging
        await sequelize.authenticate({
            logging: false
        }).catch(error => {
            console.error('Database authentication error:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        });
        console.log('Database connection established successfully');
        
        // Sync database models without logging
        await sequelize.sync({   
            alter: {  
                drop: false  
            },
            logging: false
        }).catch(error => {
            console.error('Database sync error:', {
                //message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        });  
        //console.log('Database models synchronized');
        
        // Initialize all cron jobs  
        MarketDataJobs.initializeJobs();  
        initializeWatchlistJob();
        initializeCompanyUpdateJob();

        // Use HTTP server instead of Express app to support WebSocket
        server.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(`🔌 API endpoints: http://localhost:${PORT}/api`);
            console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws`);
            console.log('📊 Market data updates: every 15 minutes on weekdays 9 AM - 4 PM ET');
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

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed');
        sequelize.close().then(() => {
            console.log('Database connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;
