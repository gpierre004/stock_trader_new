import api from './api';

const maintenanceService = {
    syncMissingCompanies: async () => {
        const response = await api.post('/maintenance/sync-missing-companies');
        return response.data;
    },
    
    syncCashTransactions: async () => {
        const response = await api.post('/transactions/sync-cash');
        return response.data;
    },

    updateFullStockHistory: async () => {
        const response = await api.post('/maintenance/update-full-stock-history');
        return response.data;
    }
};

export default maintenanceService;
