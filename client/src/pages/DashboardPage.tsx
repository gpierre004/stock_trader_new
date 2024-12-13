import React from 'react';
import { Box, Container, Grid } from '@mui/material';
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
    <Box 
      sx={{ 
        backgroundColor: (theme) => theme.palette.grey[100],
        minHeight: '100vh',
        py: 4
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1800px' }}>
        <Grid container spacing={3}>
          {/* Market Overview Section */}
          <Grid item xs={12}>
            <MarketOverview 
              data={marketData}
              isLoading={marketLoading}
            />
          </Grid>

          {/* Bullish Stocks Analysis */}
          <Grid item xs={12} md={6}>
            <BullishStocksTable 
              data={bullishData || []}
              isLoading={bullishLoading}
            />
          </Grid>

          {/* Buy/Sell Signals */}
          <Grid item xs={12} md={6}>
            <BuySellSignalsTable 
              data={signalsData || []}
              isLoading={signalsLoading}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
