// routes/index.js  
// Add these routes to your existing routes  
router.post('/companies/refresh', auth, stockController.refreshCompanies);  
router.get('/companies/active', stockController.getActiveCompanies);  