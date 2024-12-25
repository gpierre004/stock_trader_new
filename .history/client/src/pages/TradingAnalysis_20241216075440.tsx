import React from 'react';
import { Box, Container, Grid, Typography, Paper, Alert } from '@mui/material';
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

interface MarketMover {
  symbol: string;
  change: number;
}

interface MarketOverviewData {
  marketTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  topGainers: MarketMover[];
  topLosers: MarketMover[];
  tradingVolume: number;
  volatilityIndex: number;
}

interface MarketOverviewResponse {
  marketTrend?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  topGainers?: Array<{ symbol?: string; change?: number }>;
  topLosers?: Array<{ symbol?: string; change?: number }>;
  tradingVolume?: number;
  volatilityIndex?: number;
}

const TradingAnalysis: React.FC = () => {
  const { 
    data: marketData, 
    isLoading: marketLoading,
    error: marketError
  } = useQuery<MarketOverviewData>({
    queryKey: ['marketOverview'],
    queryFn: async () => {
      try {
        const response = await api.get<MarketOverviewResponse>('/market-data/overview');
        const data = response.data;
        
        // Transform and validate the response data
        return {
          marketTrend: data.marketTrend || 'NEUTRAL',
          topGainers: Array.isArray(data.topGainers) ? data.topGainers.map((gainer: { symbol?: string; change?: number }) => ({
            symbol: gainer.symbol || '',
            change: typeof gainer.change === 'number' ? Number(gainer.change.toFixed(2)) : 0
          })) : [],
          topLosers: Array.isArray(data.topLosers) ? data.topLosers.map((loser: { symbol?: string; change?: number }) => ({
            symbol: loser.symbol || '',
            change: typeof loser.change === 'number' ? Number(loser.change.toFixed(2)) : 0
          })) : [],
          tradingVolume: typeof data.tradingVolume === 'number' ? data.tradingVolume : 0,
          volatilityIndex: typeof data.volatilityIndex === 'number' ? Number(data.volatilityIndex.toFixed(2)) : 0
        };
      } catch (error) {
        console.error('Market overview fetch error:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const { 
    data: bullishData, 
    isLoading: bullishLoading,
    error: bullishError
  } = useQuery<BullishStock[]>({
    queryKey: ['bullishStocks'],
    queryFn: () => api.get('/market-data/bullish-stocks').then(res => res.data),
    retry: 2,
    staleTime: 30000,
  });

  const { 
    data: signalsData, 
    isLoading: signalsLoading,
    error: signalsError
  } = useQuery<BuySellSignal[]>({
    queryKey: ['buySellSignals'],
    queryFn: () => api.get('/market-data/buy-sell-signals').then(res => res.data),
    retry: 2,
    staleTime: 30000,
  });

  const { 
    data: momentumData, 
    isLoading: momentumLoading,
    error: momentumError
  } = useQuery<MomentumData[]>({
    queryKey: ['momentumAnalysis'],
    queryFn: () => api.get('/market-data/momentum-analysis').then(res => res.data),
    retry: 2,
    staleTime: 30000,
  });

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trading Analysis
        </Typography>
        
        {(marketError || bullishError || signalsError || momentumError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading market data. Please try again later.
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MarketOverview 
              data={marketData}
              isLoading={marketLoading}
            />
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
