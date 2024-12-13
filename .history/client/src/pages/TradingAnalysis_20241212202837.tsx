import React from 'react';
import { Box, Container, Grid, Typography, Paper } from '@mui/material';
import BullishStocksTable from '../components/analysis/BullishStocksTable';
import BuySellSignalsTable from '../components/analysis/BuySellSignalsTable';
import MomentumAnalysisTable from '../components/analysis/MomentumAnalysisTable';
import MarketOverview from '../components/analysis/MarketOverview';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface BullishStock {
  symbol: string;
  company: string;
  price: number;
  change: number;
  volume: number;
}

interface BuySellSignal {
  symbol: string;
  signal: 'buy' | 'sell';
  price: number;
  strength: number;
  timestamp: string;
}

interface MomentumData {
  symbol: string;
  momentum: number;
  trend: string;
  volume: number;
}

interface MarketOverviewData {
  marketTrend: string;
  topGainers: Array<{ symbol: string; change: number }>;
  topLosers: Array<{ symbol: string; change: number }>;
  tradingVolume: number;
}

const TradingAnalysis: React.FC = () => {
  const { data: bullishData, isLoading: bullishLoading } = useQuery<BullishStock[]>({
    queryKey: ['bullishStocks'],
    queryFn: () => api.get('/market-data/bullish-stocks').then(res => res.data)
  });

  const { data: signalsData, isLoading: signalsLoading } = useQuery<BuySellSignal[]>({
    queryKey: ['buySellSignals'],
    queryFn: () => api.get('/market-data/buy-sell-signals').then(res => res.data)
  });

  const { data: momentumData, isLoading: momentumLoading } = useQuery<MomentumData[]>({
    queryKey: ['momentumAnalysis'],
    queryFn: () => api.get('/market-data/momentum-analysis').then(res => res.data)
  });

  const { data: marketOverview, isLoading: marketOverviewLoading } = useQuery<MarketOverviewData>({
    queryKey: ['marketOverview'],
    queryFn: () => api.get('/market-data/overview').then(res => res.data)
  });

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
                data={marketOverview || null} 
                isLoading={marketOverviewLoading} 
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <BullishStocksTable 
                data={bullishData || []} 
                isLoading={bullishLoading} 
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <BuySellSignalsTable 
                data={signalsData || []} 
                isLoading={signalsLoading} 
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <MomentumAnalysisTable 
                data={momentumData || []} 
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
