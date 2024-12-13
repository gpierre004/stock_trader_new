import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Paper } from '@mui/material';
import BullishStocksTable from '../components/analysis/BullishStocksTable';
import BuySellSignalsTable from '../components/analysis/BuySellSignalsTable';
import MomentumAnalysisTable from '../components/analysis/MomentumAnalysisTable';
import MarketOverview from '../components/analysis/MarketOverview';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const TradingAnalysis: React.FC = () => {
  const { data: bullishData, isLoading: bullishLoading } = useQuery(
    ['bullishStocks'],
    () => api.get('/market-data/bullish-stocks').then(res => res.data)
  );

  const { data: signalsData, isLoading: signalsLoading } = useQuery(
    ['buySellSignals'],
    () => api.get('/market-data/buy-sell-signals').then(res => res.data)
  );

  const { data: momentumData, isLoading: momentumLoading } = useQuery(
    ['momentumAnalysis'],
    () => api.get('/market-data/momentum-analysis').then(res => res.data)
  );

  const { data: marketOverview, isLoading: marketOverviewLoading } = useQuery(
    ['marketOverview'],
    () => api.get('/market-data/overview').then(res => res.data)
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trading Analysis
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <MarketOverview 
                data={marketOverview} 
                isLoading={marketOverviewLoading} 
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <BullishStocksTable 
                data={bullishData} 
                isLoading={bullishLoading} 
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <BuySellSignalsTable 
                data={signalsData} 
                isLoading={signalsLoading} 
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <MomentumAnalysisTable 
                data={momentumData} 
                isLoading={momentumLoading} 
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TradingAnalysis;
