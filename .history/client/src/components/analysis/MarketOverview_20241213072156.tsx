import React from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Market Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Market Trend
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {data.marketTrend === 'BULLISH' ? (
                  <TrendingUpIcon color="success" />
                ) : data.marketTrend === 'BEARISH' ? (
                  <TrendingDownIcon color="error" />
                ) : null}
                <Typography variant="h5">
                  {data.marketTrend}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Trading Volume: {new Intl.NumberFormat().format(data.tradingVolume)}
              </Typography>
              <Typography variant="body2">
                Volatility Index: {data.volatilityIndex.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Top Gainers
              </Typography>
              <Stack spacing={1}>
                {data.topGainers.map((gainer) => (
                  <Chip
                    key={gainer.symbol}
                    label={`${gainer.symbol} +${gainer.change.toFixed(2)}%`}
                    color="success"
                    size="small"
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Top Losers
              </Typography>
              <Stack spacing={1}>
                {data.topLosers.map((loser) => (
                  <Chip
                    key={loser.symbol}
                    label={`${loser.symbol} ${loser.change.toFixed(2)}%`}
                    color="error"
                    size="small"
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketOverview;
