// src/components/analysis/MomentumAnalysisTable.tsx  
import React from 'react';  
import {  
  Table,  
  TableBody,  
  TableCell,  
  TableContainer,  
  TableHead,  
  TableRow,  
  CircularProgress,  
  Box,  
  LinearProgress,  
  Typography  
} from '@mui/material';  

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

interface Props {  
  data: MomentumData[];  
  isLoading: boolean;  
}  

const MomentumAnalysisTable: React.FC<Props> = ({ data, isLoading }) => {  
  if (isLoading) {  
    return (  
      <Box display="flex" justifyContent="center" p={3}>  
        <CircularProgress />  
      </Box>  
    );  
  }  

  return (  
    <TableContainer>  
      <Table>  
        <TableHead>  
          <TableRow>  
            <TableCell>Ticker</TableCell>  
            <TableCell align="right">Current Price</TableCell>  
            <TableCell align="right">30D Return</TableCell>  
            <TableCell>Price Range</TableCell>  
            <TableCell>Performance</TableCell>  
          </TableRow>  
        </TableHead>  
        <TableBody>  
          {data.map((row) => {  
            const pricePosition = ((row.latest_close - row.min_close_30d) /   
              (row.max_close_30d - row.min_close_30d)) * 100;  

            return (  
              <TableRow key={row.ticker}>  
                <TableCell>{row.ticker}</TableCell>  
                <TableCell align="right">${row.latest_close.toFixed(2)}</TableCell>  
                <TableCell align="right">  
                  <Typography  
                    color={row.thirty_day_return >= 0 ? 'success.main' : 'error.main'}  
                  >  
                    {row.thirty_day_return.toFixed(2)}%  
                  </Typography>  
                </TableCell>  
                <TableCell>  
                  <Box sx={{ width: '100%', mr: 1 }}>  
                    <LinearProgress  
                      variant="determinate"  
                      value={pricePosition}  
                      sx={{ height: 8, borderRadius: 4 }}  
                    />  
                    <Box  
                      sx={{  
                        display: 'flex',  
                        justifyContent: 'space-between',  
                        mt: 0.5,  
                        fontSize: '0.75rem'  
                      }}  
                    >  
                      <span>${row.min_close_30d.toFixed(2)}</span>  
                      <span>${row.max_close_30d.toFixed(2)}</span>  
                    </Box>  
                  </Box>  
                </TableCell>  
                <TableCell>  
                  <Box  
                    component="span"  
                    px={1}  
                    py={0.5}  
                    borderRadius={1}  
                    bgcolor={row.performance_trend === 'UPWARD' ? 'success.light' : 'error.light'}  
                    color={row.performance_trend === '  