import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import MarketOverview from '../components/analysis/MarketOverview';

// Mock data for development
const mockMarketData = {
  marketTrend: 'BULLISH' as const,
  topGainers: [
    { symbol: 'AAPL', change: 2.5 },
    { symbol: 'MSFT', change: 1.8 },
    { symbol: 'GOOGL', change: 1.5 }
  ],
  topLosers: [
    { symbol: 'META', change: -1.2 },
    { symbol: 'NFLX', change: -0.8 },
    { symbol: 'AMZN', change: -0.5 }
  ],
  tradingVolume: 1234567,
  volatilityIndex: 15.7
};

const DashboardPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome to your investment portfolio dashboard
            </Typography>
          </Paper>
        </Grid>

        {/* Market Overview Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <MarketOverview data={mockMarketData} isLoading={false} />
          </Paper>
        </Grid>

        {/* Portfolio Summary Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Portfolio Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your portfolio details will be displayed here
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick access to common actions will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
