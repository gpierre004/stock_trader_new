import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import api from '../services/api';
import maintenanceService from '../services/maintenanceService';

const MaintenancePage = () => {
  const [formData, setFormData] = useState({
    ticker: '',
    quantity: '',
    price: '',
    type: '',
    date: '',
    account_id: ''
  });

  const [message, setMessage] = useState('');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await api.get('/api/accounts');
        setAccounts(response.data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    fetchAccounts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ticker: formData.ticker.toUpperCase().trim(),
        quantity: parseFloat(formData.quantity),
        purchase_price: parseFloat(formData.price),
        type: formData.type.toUpperCase().trim(),
        purchase_date: formData.date,
        account_id: formData.account_id
      };

      const response = await api.post('/api/transactions', transactionData);
      setMessage(`Transaction added successfully. New cash balance: $${response.data.cashBalance.toFixed(2)}`);
      setFormData(prev => ({ 
        ticker: '', 
        quantity: '', 
        price: '', 
        type: '', 
        date: '', 
        account_id: '',
        maintenance_account_id: prev.maintenance_account_id 
      }));
    } catch (error) {
      console.error('Transaction error:', error);
      setMessage(error.response?.data?.error || 'Error adding transaction');
    }
  };

  const handleLoadTemplateData = async () => {
    try {
      const response = await api.post('/api/transactions/load-template');
      setMessage('Template data loaded successfully');
      console.log('Template load response:', response.data);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error loading template data');
      console.error('Template load error:', error);
    }
  };

  const handleUpdateMarketData = async () => {
    try {
      await api.post('/api/maintenance/update-market-data');
      setMessage('Market data updated successfully');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating market data');
    }
  };

  const handleUpdateWatchlist = async () => {
    try {
      await api.post('/api/maintenance/update-watchlist');
      setMessage('Watchlist updated successfully');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating watchlist');
    }
  };

  const handleSyncMissingCompanies = async () => {
    try {
      const result = await maintenanceService.syncMissingCompanies(formData.maintenance_account_id);
      setMessage(`Companies synced successfully. ${result.inserted} companies added.`);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error syncing companies');
    }
  };

  const handleSyncCashTransactions = async () => {
    try {
      const result = await maintenanceService.syncCashTransactions(formData.maintenance_account_id);
      setMessage(`Cash transactions synced successfully. ${result.synced} transactions processed. New balance: $${result.finalCashBalance.toFixed(2)}`);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error syncing cash transactions');
    }
  };

  const handleUpdateFullStockHistory = async () => {
    try {
      const result = await maintenanceService.updateFullStockHistory(formData.maintenance_account_id);
      setMessage(`Full stock history update completed successfully. ${result.updated} stocks updated.`);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating full stock history');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Maintenance Page
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Management
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="maintenance-account-label">Select Account</InputLabel>
              <Select
                labelId="maintenance-account-label"
                label="Select Account"
                name="maintenance_account_id"
                value={formData.maintenance_account_id || ''}
                onChange={handleInputChange}
              >
                <MenuItem value="">All Accounts</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.account_name} ({account.account_number})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handleLoadTemplateData}>
                Load Template Data
              </Button>
              <Button variant="contained" onClick={handleUpdateMarketData}>
                Update Market Data
              </Button>
              <Button variant="contained" onClick={handleUpdateWatchlist}>
                Update Watchlist
              </Button>
              <Button variant="contained" onClick={handleSyncMissingCompanies}>
                Sync Missing Companies
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSyncCashTransactions}
                color="secondary"
              >
                Sync Cash Transactions
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpdateFullStockHistory}
                color="primary"
              >
                Update Full Stock History
              </Button>
            </Box>
          </Paper>

          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add Transaction
            </Typography>
            <form onSubmit={handleSubmitTransaction}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <input
                  type="text"
                  name="ticker"
                  placeholder="Ticker"
                  value={formData.ticker}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="type"
                  placeholder="Type (BUY/SELL)"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                <select
                  name="account_id"
                  value={formData.account_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select Portfolio/Account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_name}
                    </option>
                  ))}
                </select>
                <button type="submit">
                  ADD TRANSACTION
                </button>
              </Box>
            </form>
          </Box>
        </Grid>
      </Grid>

      {message && (
        <Typography 
          color={message.includes('Error') ? 'error' : 'primary'} 
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default MaintenancePage;
