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