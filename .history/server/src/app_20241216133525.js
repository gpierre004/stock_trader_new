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
const MarketDataJobs = require('./jobs/MarketDataJobs');  
const { initializeCompanyUpdateJob } = require('./jobs/companyUpdateJob');
const { initializeWatchlistJob } = require('./jobs/watchlistJob');
const MaintenanceJobs = require('./jobs/maintenanceJobs');
const WebSocket = require('ws');
const http = require('http');

// Rest of the file remains unchanged
[Previous content continues...]
