// src/components/analysis/BullishStocksTable.tsx  
import React from 'react';  
import {  
  Table,  
  TableBody,  
  TableCell,  
  TableContainer,  
  TableHead,  
  TableRow,  
  CircularProgress,  
  Box  
} from '@mui/material';  

interface BullishStock {  
  ticker: string;  
  latest_close: number;  
  close_30d_ago: number;  
  close_90d_ago: number;  
  thirty_day_momentum: number;  
  ninety_day_momentum: number;  
  momentum_trend: string;  
}  

interface Props {  
  data: BullishStock[];  
  isLoading: boolean;  
}  

const BullishStocksTable: React.FC<Props> = ({ data, isLoading }) => {  
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
            <TableCell align="right">Latest Close</TableCell>  
            <TableCell align="right">30D Momentum</TableCell>  
            <TableCell align="right">90D Momentum</TableCell>  
            <TableCell>Trend</TableCell>  
          </TableRow>  
        </TableHead>  
        <TableBody>  
          {data.map((row) => (  
            <TableRow key={row.ticker}>  
              <TableCell component="th" scope="row">  
                {row.ticker}  
              </TableCell>  
              <TableCell align="right">${row.latest_close.toFixed(2)}</TableCell>  
              <TableCell align="right">{row.thirty_day_momentum.toFixed(2)}%</TableCell>  
              <TableCell align="right">{row.ninety_day_momentum.toFixed(2)}%</TableCell>  
              <TableCell>  
                <Box  
                  component="span"  
                  px={1}  
                  py={0.5}  
                  borderRadius={1}  
                  bgcolor={row.momentum_trend === 'BULLISH' ? 'success.light' : 'error.light'}  
                  color={row.momentum_trend === 'BULLISH' ? 'success.dark' : 'error.dark'}  
                >  
                  {row.momentum_trend}  
                </Box>  
              </TableCell>  
            </TableRow>  
          ))}  
        </TableBody>  
      </Table>  
    </TableContainer>  
  );  
};  

export default BullishStocksTable;  