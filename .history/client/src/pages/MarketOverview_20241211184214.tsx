// src/components/analysis/MarketOverview.tsx  
import React from 'react';  
import { Grid, Paper, Box, Typography } from '@mui/material';  
import TrendingUpIcon from '@mui/icons-material/TrendingUp';  
import TrendingDownIcon from '@mui/icons-material/TrendingDown';  
import ShowChartIcon from '@mui/icons-material/ShowChart';  

interface MarketOverviewProps {  
  bullishCount: number;  
  buySellData: any[];  
  momentumData: any[];  
}  

const MarketOverview: React.FC<MarketOverviewProps> = ({  
  bullishCount,  
  buySellData,  
  momentumData  
}) => {  
  const buySignals = buySellData.filter(item => item.overall_signal === 'BUY').length;  
  const sellSignals = buySellData.filter(item => item.overall_signal === 'SELL').length;  
  const positiveMonentum = momentumData.filter(item => item.performance_trend === 'UPWARD').length;  

  return (  
    <Grid container spacing={3}>  
      <Grid item xs={12} sm={6} md={3}>  
        <Paper elevation={2}>  
          <Box p={3} display="flex" alignItems="center">  
            <Box flexGrow={1}>  
              <Typography variant="subtitle2" color="textSecondary">  
                Bullish Stocks  
              </Typography>  
              <Typography variant="h4">  
                {bullishCount}  
              </Typography>  
            </Box>  
            <TrendingUpIcon color="primary" fontSize="large" />  
          </Box>  
        </Paper>  
      </Grid>  

      <Grid item xs={12} sm={6} md={3}>  
        <Paper elevation={2}>  
          <Box p={3} display="flex" alignItems="center">  
            <Box flexGrow={1}>  
              <Typography variant="subtitle2" color="textSecondary">  
                Buy Signals  
              </Typography>  
              <Typography variant="h4">  
                {buySignals}  
              </Typography>  
            </Box>  
            <ShowChartIcon color="success" fontSize="large" />  
          </Box>  
        </Paper>  
      </Grid>  

      <Grid item xs={12} sm={6} md={3}>  
        <Paper elevation={2}>  
          <Box p={3} display="flex" alignItems="center">  
            <Box flexGrow={1}>  
              <Typography variant="subtitle2" color="textSecondary">  
                Sell Signals  
              </Typography>  
              <Typography variant="h4">  
                {sellSignals}  
              </Typography>  
            </Box>  
            <TrendingDownIcon color="error" fontSize="large" />  
          </Box>  
        </Paper>  
      </Grid>  

      <Grid item xs={12} sm={6} md={3}>  
        <Paper elevation={2}>  
          <Box p={3} display="flex" alignItems="center">  
            <Box flexGrow={1}>  
              <Typography variant="subtitle2" color="textSecondary">  
                Positive Momentum  
              </Typography>  
              <Typography variant="h4">  
                {positiveMonentum}  
              </Typography>  
            </Box>  
            <ShowChartIcon color="primary" fontSize="large" />  
          </Box>  
        </Paper>  
      </Grid>  
    </Grid>  
  );  
};  

export default MarketOverview;  