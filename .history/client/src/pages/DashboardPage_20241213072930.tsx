import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import MarketOverview from '../components/analysis/MarketOverview';
import BullishStocksTable from '../components/analysis/BullishStocksTable';
import BuySellSignalsTable from '../components/analysis/BuySellSignalsTable';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const DashboardPage: React.FC = () => {
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['marketOverview'],
    queryFn: () => api.get('/market-data/overview').then(res => res.data)
  });

  const { data: bullishData, isLoading: bullishLoading } = useQuery({
    queryKey: ['bullishStocks'],
    queryFn: () => api.get('/market-data/bullish-stocks').then(res => res.data)
  });

  const { data: signalsData, isLoading: signalsLoading } = useQuery({
    queryKey: ['buySellSignals'],
    queryFn: () => api.get('/market-data/buy-sell-signals').then(res => res.data)
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Market Overview Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <MarketOverview 
              data={marketData}
              isLoading={marketLoading}
            />
          </Paper>
        </Grid>

        {/* Bullish Stocks Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BullishStocksTable 
              data={bullishData || []}
              isLoading={bullishLoading}
            />
          </Paper>
        </Grid>

        {/* Buy/Sell Signals */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BuySellSignalsTable 
              data={signalsData || []}
              isLoading={signalsLoading}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
