import api from './api';

const maintenanceService = {
    syncMissingCompanies: async () => {
        const response = await api.post('/maintenance/sync-missing-companies');
        return response.data;
    }
};

export default maintenanceService;
