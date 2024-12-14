import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid } from '@mui/material';
import api from '../services/api';
import maintenanceService from '../services/maintenanceService';

const MaintenancePage = () => {
  const [formData, setFormData] = useState({
    ticker: '',
    quantity: '',
    price: '',
    type: '',
    date: ''
  });

  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', formData);
      setMessage('Transaction added successfully');
      setFormData({ ticker: '', quantity: '', price: '', type: '', date: '' });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error adding transaction');
    }
  };

  const handleLoadTemplateData = async () => {
    try {
      const response = await api.post('/transactions/load-template');
      setMessage('Template data loaded successfully');
      console.log('Template load response:', response.data);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error loading template data');
      console.error('Template load error:', error);
    }
  };

  const handleUpdateMarketData = async () => {
    try {
      await api.post('/maintenance/update-market-data');
      setMessage('Market data updated successfully');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating market data');
    }
  };

  const handleUpdateWatchlist = async () => {
    try {
      await api.post('/maintenance/update-watchlist');
      setMessage('Watchlist updated successfully');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating watchlist');
    }
  };

  const handleSyncMissingCompanies = async () => {
    try {
      const result = await maintenanceService.syncMissingCompanies();
      setMessage(`Companies synced successfully. ${result.inserted} companies added.`);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error syncing companies');
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
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add Transaction
            </Typography>
            <form onSubmit={handleSubmitTransaction}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Ticker"
                  name="ticker"
                  value={formData.ticker}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  label="Type (BUY/SELL)"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <Button type="submit" variant="contained">
                  Add Transaction
                </Button>
              </Box>
            </form>
          </Paper>
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
