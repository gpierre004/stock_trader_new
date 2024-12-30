import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import MarketOverview from '../components/analysis/MarketOverview';
import BullishStocksTable from '../components/analysis/BullishStocksTable';
import BuySellSignalsTable from '../components/analysis/BuySellSignalsTable';
import PortfolioHeatMap from '../components/analysis/PortfolioHeatMap';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const PortfolioOverview: React.FC = () => {
  // First fetch portfolio tickers
  const { data: portfolioTickers = [] } = useQuery({
    queryKey: ['portfolioTickers'],
    queryFn: () => api.get('/api/transactions/tickers').then(res => res.data)
  });

  // Then fetch data filtered by those tickers
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['portfolioMarketOverview', portfolioTickers],
    queryFn: () => api.get(`/api/market-data/overview?tickers=${portfolioTickers.join(',')}`).then(res => res.data),
    enabled: portfolioTickers.length > 0
  });

  const { data: bullishData, isLoading: bullishLoading } = useQuery({
    queryKey: ['portfolioBullishStocks', portfolioTickers],
    queryFn: () => api.get(`/api/market-data/bullish-stocks?tickers=${portfolioTickers.join(',')}`).then(res => res.data),
    enabled: portfolioTickers.length > 0
  });

  const { data: signalsData, isLoading: signalsLoading } = useQuery({
    queryKey: ['portfolioBuySellSignals', portfolioTickers],
    queryFn: () => api.get(`/api/market-data/buy-sell-signals?tickers=${portfolioTickers.join(',')}`).then(res => res.data),
    enabled: portfolioTickers.length > 0
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
        <Typography variant="h4" component="h1" gutterBottom sx={{ px: 2 }}>
          Portfolio Overview
        </Typography>
        
        <Grid container spacing={3}>
          {/* Portfolio Heat Map */}
          <Grid item xs={12}>
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 1 }}>
              <PortfolioHeatMap 
                data={marketData?.stocks || []}
                isLoading={marketLoading}
              />
            </Box>
          </Grid>

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

export default PortfolioOverview;
