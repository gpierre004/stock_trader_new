// controllers/stockController.js  
const CompanyService = require('../services/companyService');

// Add this to your existing stockController  
const stockController = {  
    // ... existing methods ...  

    refreshCompanies: async (req, res) => {  
        try {  
            const result = await CompanyService.refreshSP500List();  
            res.json({  
                message: 'Successfully refreshed S&P 500 companies',  
                stats: result  
            });  
        } catch (error) {  
            console.error('Error in refreshCompanies:', error);  
            res.status(500).json({ error: error.message });  
        }  
    },  

    getActiveCompanies: async (req, res) => {  
        try {  
            const companies = await CompanyService.getActiveCompanies();  
            res.json(companies);  
        } catch (error) {  
            console.error('Error in getActiveCompanies:', error);  
            res.status(500).json({ error: error.message });  
        }  
    }  
};  