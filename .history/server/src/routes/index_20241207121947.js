// routes/index.js  
// Add these routes to your existing routes  
const stockController = require('../controllers/stockController');  
router.post('/companies/refresh', auth, stockController.refreshCompanies);  
router.get('/companies/active', stockController.getActiveCompanies);  