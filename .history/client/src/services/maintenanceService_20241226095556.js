import api from './api';

const maintenanceService = {
    syncMissingCompanies: async (accountId) => {
        const response = await api.post('/api/maintenance/sync-missing-companies', { accountId });
        return response.data;
    },
    
    syncCashTransactions: async (accountId) => {
        const response = await api.post('/api/transactions/sync-cash', { accountId });
        return response.data;
    },

    updateFullStockHistory: async (accountId) => {
        const response = await api.post('/api/maintenance/update-full-stock-history', { accountId });
        return response.data;
    }
};

export default maintenanceService;
