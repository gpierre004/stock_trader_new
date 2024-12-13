// src/pages/TradingAnalysis.tsx  
import React, { useState, useEffect } from 'react';  
import { Box, Container, Grid, Typography, Paper } from '@mui/material';  
import BullishStocksTable from '../components/analysis/BullishStocksTable';  
import BuySellSignalsTable from '../components/analysis/BuySellSignalsTable';  
import MomentumAnalysisTable from '../components/analysis/MomentumAnalysisTable';  
import MarketOverview from '../components/analysis/MarketOverview';  
import { useQuery } from 'react-query';  
import { api } from '../services/api';  

const TradingAnalysis: React.FC = () => {  
  const { data: bullishData, isLoading: bullishLoading } = useQuery(  
    'bullish-stocks',  
    () => api.get('/market-analysis/bullish')  
  );  

  const { data: buySellData, isLoading: buySellLoading } = useQuery(  
    'buy-sell-signals',  
    () => api.get('/market-analysis/buy-sell')  
  );  

  const { data: momentumData, isLoading: momentumLoading } = useQuery(  
    'momentum-analysis',  
    () => api.get('/market-analysis/momentum')  
  );  

  return (  
    <Container maxWidth="xl">  
      <Box py={4}>  
        <Typography variant="h4" gutterBottom>  
          Trading Analysis Dashboard  
        </Typography>  

        <Grid container spacing={3}>  
          {/* Market Overview Cards */}  
          <Grid item xs={12}>  
            <MarketOverview   
              bullishCount={bullishData?.length || 0}  
              buySellData={buySellData || []}  
              momentumData={momentumData || []}  
            />  
          </Grid>  

          {/* Bullish Stocks Section */}  
          <Grid item xs={12} lg={6}>  
            <Paper elevation={2}>  
              <Box p={3}>  
                <Typography variant="h6" gutterBottom>  
                  Bullish Stocks  
                </Typography>  
                <BullishStocksTable   
                  data={bullishData || []}   
                  isLoading={bullishLoading}   
                />  
              </Box>  
            </Paper>  
          </Grid>  

          {/* Buy/Sell Signals Section */}  
          <Grid item xs={12} lg={6}>  
            <Paper elevation={2}>  
              <Box p={3}>  
                <Typography variant="h6" gutterBottom>  
                  Buy/Sell Signals  
                </Typography>  
                <BuySellSignalsTable   
                  data={buySellData || []}   
                  isLoading={buySellLoading}   
                />  
              </Box>  
            </Paper>  
          </Grid>  

          {/* Momentum Analysis Section */}  
          <Grid item xs={12}>  
            <Paper elevation={2}>  
              <Box p={3}>  
                <Typography variant="h6" gutterBottom>  
                  Momentum Analysis  
                </Typography>  
                <MomentumAnalysisTable   
                  data={momentumData || []}   
                  isLoading={momentumLoading}   
                />  
              </Box>  
            </Paper>  
          </Grid>  
        </Grid>  
      </Box>  
    </Container>  
  );  
};  

export default TradingAnalysis;  