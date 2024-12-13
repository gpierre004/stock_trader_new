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
  Chip,
  Paper,
  Typography,
  useTheme
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
  const theme = useTheme();

  const getVolumeTrendColor = (trend: string) => {
    switch (trend) {
      case 'HIGH':
        return 'success';
      case 'LOW':
        return 'error';
      default:
        return 'default';
    }
  };

  const getVolatilityColor = (category: string) => {
    switch (category) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY':
      case 'BUY':
        return 'success';
      case 'HOLD':
        return 'warning';
      case 'SELL':
      case 'STRONG_SELL':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom component="div">
          Buy/Sell Signals
        </Typography>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Ticker
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Price
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Volume
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Volatility
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Support
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Resistance
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Signal
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow 
                  key={row.ticker}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell sx={{ fontWeight: 'medium' }}>{row.ticker}</TableCell>
                  <TableCell align="right">${row.latest_close.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.volume_trend}
                      size="small"
                      color={getVolumeTrendColor(row.volume_trend)}
                      sx={{ minWidth: '80px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.volatility_category}
                      size="small"
                      color={getVolatilityColor(row.volatility_category)}
                      sx={{ minWidth: '80px' }}
                    />
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ color: theme.palette.success.main }}
                  >
                    ${row.support_level_25.toFixed(2)}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ color: theme.palette.error.main }}
                  >
                    ${row.resistance_level_75.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.overall_signal.replace('_', ' ')}
                      size="small"
                      color={getSignalColor(row.overall_signal)}
                      sx={{ 
                        minWidth: '100px',
                        fontWeight: 'medium'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default BuySellSignalsTable;
