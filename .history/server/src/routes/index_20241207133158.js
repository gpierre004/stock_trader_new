// src/routes/index.js  
const express = require('express');  
const router = express.Router();  
const auth = require('../middleware/auth');  
const stockController = require('../controllers/stockController');  

// Stock routes  
router.post('/companies/refresh', auth, stockController.refreshCompanies);  
router.get('/companies/active', stockController.getActiveCompanies);  

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Export the router  
module.exports = router;
