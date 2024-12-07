// src/routes/index.js  
const express = require('express');  
const router = express.Router();  
const auth = require('../middleware/auth');  // Make sure this path is correct  
const stockController = require('../controllers/stockController');  

// Stock routes  
router.post('/companies/refresh', auth, stockController.refreshCompanies);  
router.get('/companies/active', stockController.getActiveCompanies);  

// Export the router  
module.exports = router;  