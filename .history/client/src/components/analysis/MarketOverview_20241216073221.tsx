import React from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  Paper,
  LinearProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';

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

interface Props {
  data?: MarketOverviewData | null;
  isLoading: boolean;
}

const MarketOverview: React.FC<Props> = ({ data, isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={3}>
        <Typography color="text.secondary">No market data available</Typography>
      </Box>
    );
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'BULLISH':
        return theme.palette.success.main;
      case 'BEARISH':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getVolatilityColor = (index: number) => {
    if (index > 20) return theme.palette.error.main;
    if (index > 15) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
        Market Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            elevation={3}
            sx={{ 
              background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.grey[50]} 90%)`,
              height: '100%'
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <ShowChartIcon sx={{ fontSize: 28, color: getTrendColor(data.marketTrend) }} />
                <Typography variant="h6" color="text.secondary">
                  Market Trend
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                {data.marketTrend === 'BULLISH' ? (
                  <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 32 }} />
                ) : data.marketTrend === 'BEARISH' ? (
                  <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 32 }} />
                ) : null}
                <Typography 
                  variant="h4"
                  sx={{ 
                    fontWeight: 'bold',
                    color: getTrendColor(data.marketTrend)
                  }}
                >
                  {data.marketTrend}
                </Typography>
              </Stack>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Trading Volume
                </Typography>
                <Typography variant="h6">
                  {data.tradingVolume ? new Intl.NumberFormat().format(data.tradingVolume) : 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Volatility Index
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography 
                    variant="h6"
                    sx={{ color: getVolatilityColor(data.volatilityIndex || 0) }}
                  >
                    {data.volatilityIndex?.toFixed(2) ?? 'N/A'}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(((data.volatilityIndex || 0) / 30) * 100, 100)}
                    sx={{ 
                      flexGrow: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getVolatilityColor(data.volatilityIndex || 0),
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card 
            elevation={3}
            sx={{ 
              height: '100%',
              background: `linear-gradient(45deg, ${theme.palette.success.light} 30%, ${theme.palette.background.paper} 90%)`
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <BarChartIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="h6" color="text.secondary">
                  Top Gainers
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {data.topGainers?.map((gainer) => (
                  <Chip
                    key={gainer.symbol}
                    label={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {gainer.symbol}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          +{gainer.change?.toFixed(2) ?? '0.00'}%
                        </Typography>
                      </Box>
                    }
                    sx={{
                      backgroundColor: theme.palette.success.light,
                      '& .MuiChip-label': { px: 2 }
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card 
            elevation={3}
            sx={{ 
              height: '100%',
              background: `linear-gradient(45deg, ${theme.palette.error.light} 30%, ${theme.palette.background.paper} 90%)`
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <BarChartIcon sx={{ color: theme.palette.error.main }} />
                <Typography variant="h6" color="text.secondary">
                  Top Losers
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {data.topLosers?.map((loser) => (
                  <Chip
                    key={loser.symbol}
                    label={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {loser.symbol}
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          {loser.change?.toFixed(2) ?? '0.00'}%
                        </Typography>
                      </Box>
                    }
                    sx={{
                      backgroundColor: theme.palette.error.light,
                      '& .MuiChip-label': { px: 2 }
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MarketOverview;
