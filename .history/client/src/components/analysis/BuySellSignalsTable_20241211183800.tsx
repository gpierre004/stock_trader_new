    // src/components/analysis/BuySellSignalsTable.tsx  
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
  Chip  
} from '@mui/material';  

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

interface Props {  
  data: BuySellSignal[];  
  isLoading: boolean;  
}  

const BuySellSignalsTable: React.FC<Props> = ({ data, isLoading }) => {  
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
            <TableCell align="right">Price</TableCell>  
            <TableCell>Volume</TableCell>  
            <TableCell>Volatility</TableCell>  
            <TableCell>Support</TableCell>  
            <TableCell>Resistance</TableCell>  
            <TableCell>Signal</TableCell>  
          </TableRow>  
        </TableHead>  
        <TableBody>  
          {data.map((row) => (  
            <TableRow key={row.ticker}>  
              <TableCell>{row.ticker}</TableCell>  
              <TableCell align="right">${row.latest_close.toFixed(2)}</TableCell>  
              <TableCell>  
                <Chip   
                  label={row.volume_trend}  
                  size="small"  
                  color={row.volume_trend === 'INCREASING' ? 'success' : 'default'}  
                />  
              </TableCell>  
              <TableCell>  
                <Chip   
                  label={row.volatility_category}  
                  size="small"  
                  color={  
                    row.volatility_category === 'LOW' ? 'success' :  
                    row.volatility_category === 'MEDIUM' ? 'warning' : 'error'  
                  }  
                />  
              </TableCell>  
              <TableCell align="right">${row.support_level_25.toFixed(2)}</TableCell>  
              <TableCell align="right">${row.resistance_level_75.toFixed(2)}</TableCell>  
              <TableCell>  
                <Chip   
                  label={row.overall_signal}  
                  size="small"  
                  color={row.overall_signal === 'BUY' ? 'success' : 'error'}  
                />  
              </TableCell>  
            </TableRow>  
          ))}  
        </TableBody>  
      </Table>  
    </TableContainer>  
  );  
};  

export default BuySellSignalsTable;  