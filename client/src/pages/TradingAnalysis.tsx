import React from 'react';
import { Box, Container, Grid, Typography, Paper } from '@mui/material';
import BullishStocksTable from '../components/analysis/BullishStocksTable';
import BuySellSignalsTable from '../components/analysis/BuySellSignalsTable';
import MomentumAnalysisTable from '../components/analysis/MomentumAnalysisTable';
import MarketOverview from '../components/analysis/MarketOverview';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// Using the exact types from the component files
interface BullishStock {
  ticker: string;
  latest_close: number;
  close_30d_ago: number;
  close_90d_ago: number;
  thirty_day_momentum: number;
  ninety_day_momentum: number;
  momentum_trend: string;
}

interface BuySellSignal {
  ticker: string;
  latest_close: number;
  thirty_day_momentum: number;
  ninety_day_momentum: number;
  momentum_trend: string;
  volume_trend: string;
  volatility_category: string;
  performance_trend: string;
  support_level_25: number;
  resistance_level_75: number;
  overall_signal: string;
}

interface MomentumData {
  ticker: string;
  latest_close: number;
  start_close_30d: number;
  end_close_30d: number;
  min_close_30d: number;
  max_close_30d: number;
  thirty_day_return: number;
  thirty_day_range: number;
  performance_trend: string;
}

interface MarketOverviewData {
  marketTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  topGainers: Array<{ symbol: string; change: number }>;
  topLosers: Array<{ symbol: string; change: number }>;
  tradingVolume: number;
  volatilityIndex: number;
}

const TradingAnalysis: React.FC = () => {
  const { data: marketData, isLoading: marketLoading } = useQuery<MarketOverviewData>({
    queryKey: ['marketOverview'],
    queryFn: () => api.get('/market-data/overview').then(res => res.data)
  });

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
                data={marketData}
                isLoading={marketLoading}
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
