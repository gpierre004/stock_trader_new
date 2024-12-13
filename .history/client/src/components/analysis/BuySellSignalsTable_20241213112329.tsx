import React, { useState } from 'react';
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
  useTheme,
  TextField,
  TableSortLabel,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

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

type Order = 'asc' | 'desc';

const SIGNAL_OPTIONS = [
  'STRONG_BUY',
  'BUY',
  'HOLD',
  'SELL',
  'STRONG_SELL'
];

const BuySellSignalsTable: React.FC<Props> = ({ data, isLoading }) => {
  const theme = useTheme();
  const [orderBy, setOrderBy] = useState<keyof BuySellSignal>('ticker');
  const [order, setOrder] = useState<Order>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [signalFilter, setSignalFilter] = useState<string>('');

  const handleRequestSort = (property: keyof BuySellSignal) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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

  const getSignalWeight = (signal: string): number => {
    switch (signal) {
      case 'STRONG_BUY': return 5;
      case 'BUY': return 4;
      case 'HOLD': return 3;
      case 'SELL': return 2;
      case 'STRONG_SELL': return 1;
      default: return 0;
    }
  };

  const getVolumeTrendWeight = (trend: string): number => {
    switch (trend) {
      case 'HIGH': return 3;
      case 'NORMAL': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  };

  const getVolatilityWeight = (category: string): number => {
    switch (category) {
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  };

  const sortData = (data: BuySellSignal[]): BuySellSignal[] => {
    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (orderBy === 'overall_signal') {
        return order === 'asc'
          ? getSignalWeight(a.overall_signal) - getSignalWeight(b.overall_signal)
          : getSignalWeight(b.overall_signal) - getSignalWeight(a.overall_signal);
      }

      if (orderBy === 'volume_trend') {
        return order === 'asc'
          ? getVolumeTrendWeight(a.volume_trend) - getVolumeTrendWeight(b.volume_trend)
          : getVolumeTrendWeight(b.volume_trend) - getVolumeTrendWeight(a.volume_trend);
      }

      if (orderBy === 'volatility_category') {
        return order === 'asc'
          ? getVolatilityWeight(a.volatility_category) - getVolatilityWeight(b.volatility_category)
          : getVolatilityWeight(b.volatility_category) - getVolatilityWeight(a.volatility_category);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return order === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  };

  const filterData = (data: BuySellSignal[]): BuySellSignal[] => {
    return data.filter(signal => {
      const matchesSearch = !searchQuery || 
        signal.ticker.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSignal = !signalFilter || signal.overall_signal === signalFilter;
      return matchesSearch && matchesSignal;
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  const sortedAndFilteredData = sortData(filterData(data));

  return (
    <Paper elevation={2}>
      <Box p={2}>
        <Typography variant="h6" component="div" gutterBottom>
          Buy/Sell Signals
        </Typography>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            size="small"
            placeholder="Search by ticker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Signal</InputLabel>
            <Select
              value={signalFilter}
              label="Filter by Signal"
              onChange={(e) => setSignalFilter(e.target.value)}
            >
              <MenuItem value="">
                <em>All Signals</em>
              </MenuItem>
              {SIGNAL_OPTIONS.map(signal => (
                <MenuItem key={signal} value={signal}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={signal.replace('_', ' ')}
                      size="small"
                      color={getSignalColor(signal)}
                      sx={{ minWidth: '100px' }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'ticker'}
                    direction={orderBy === 'ticker' ? order : 'asc'}
                    onClick={() => handleRequestSort('ticker')}
                  >
                    Ticker
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'latest_close'}
                    direction={orderBy === 'latest_close' ? order : 'asc'}
                    onClick={() => handleRequestSort('latest_close')}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'volume_trend'}
                    direction={orderBy === 'volume_trend' ? order : 'asc'}
                    onClick={() => handleRequestSort('volume_trend')}
                  >
                    Volume
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'volatility_category'}
                    direction={orderBy === 'volatility_category' ? order : 'asc'}
                    onClick={() => handleRequestSort('volatility_category')}
                  >
                    Volatility
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'support_level_25'}
                    direction={orderBy === 'support_level_25' ? order : 'asc'}
                    onClick={() => handleRequestSort('support_level_25')}
                  >
                    Support
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'resistance_level_75'}
                    direction={orderBy === 'resistance_level_75' ? order : 'asc'}
                    onClick={() => handleRequestSort('resistance_level_75')}
                  >
                    Resistance
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'overall_signal'}
                    direction={orderBy === 'overall_signal' ? order : 'asc'}
                    onClick={() => handleRequestSort('overall_signal')}
                  >
                    Signal
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAndFilteredData.map((row) => (
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
