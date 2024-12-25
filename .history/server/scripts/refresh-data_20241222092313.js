const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'test@example.com';
const PASSWORD = 'password123';

async function login() {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        return response.data.token;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
    }
}

async function refreshData() {
    try {
        // Login to get token
        const token = await login();
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('Starting data refresh sequence...');

        // Step 1: Refresh S&P 500 list
        console.log('\nRefreshing S&P 500 companies list...');
        const sp500Result = await axios.post(
            `${API_URL}/maintenance/refresh-sp500`,
            {},
            config
        );
        console.log('S&P 500 refresh result:', sp500Result.data);

        // Step 2: Sync missing companies
        console.log('\nSyncing missing companies...');
        const syncResult = await axios.post(
            `${API_URL}/maintenance/sync-missing-companies`,
            {},
            config
        );
        console.log('Sync result:', syncResult.data);

        // Step 3: Update full stock history
        console.log('\nUpdating full stock history...');
        const historyResult = await axios.post(
            `${API_URL}/maintenance/update-full-stock-history`,
            {},
            config
        );
        console.log('History update result:', historyResult.data);

        console.log('\nData refresh sequence completed successfully!');
    } catch (error) {
        if (error.response) {
            console.error('Error response:', {
                status: error.response.status,
                data: error.response.data
            });
        } else {
            console.error('Error during data refresh:', error.message);
        }
        process.exit(1);
    }
}

// Run the refresh sequence
refreshData();
