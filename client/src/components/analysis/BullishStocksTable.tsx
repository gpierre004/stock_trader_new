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

type Order = 'asc' | 'desc';

const TREND_OPTIONS = [
  'STRONG_UPTREND',
  'UPTREND',
  'NEUTRAL',
  'DOWNTREND',
  'STRONG_DOWNTREND'
];

const BullishStocksTable: React.FC<Props> = ({ data, isLoading }) => {
  const theme = useTheme();
  const [orderBy, setOrderBy] = useState<keyof BullishStock>('ticker');
  const [order, setOrder] = useState<Order>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendFilter, setTrendFilter] = useState<string>('');

  const handleRequestSort = (property: keyof BullishStock) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const getMomentumColor = (momentum: number) => {
    if (momentum >= 5) return { color: theme.palette.success.main };
    if (momentum <= -5) return { color: theme.palette.error.main };
    return { color: theme.palette.text.primary };
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'STRONG_UPTREND':
        return {
          bgcolor: theme.palette.success.light,
          color: theme.palette.success.dark
        };
      case 'UPTREND':
        return {
          bgcolor: theme.palette.success.light,
          color: theme.palette.success.dark
        };
      case 'STRONG_DOWNTREND':
        return {
          bgcolor: theme.palette.error.light,
          color: theme.palette.error.dark
        };
      case 'DOWNTREND':
        return {
          bgcolor: theme.palette.error.light,
          color: theme.palette.error.dark
        };
      default:
        return {
          bgcolor: theme.palette.grey[200],
          color: theme.palette.text.secondary
        };
    }
  };

  const sortData = (data: BullishStock[]): BullishStock[] => {
    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

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

  const filterData = (data: BullishStock[]): BullishStock[] => {
    return data.filter(stock => {
      const matchesSearch = !searchQuery || 
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrend = !trendFilter || stock.momentum_trend === trendFilter;
      return matchesSearch && matchesTrend;
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
          Bullish Stocks Analysis
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
            <InputLabel>Filter by Trend</InputLabel>
            <Select
              value={trendFilter}
              label="Filter by Trend"
              onChange={(e) => setTrendFilter(e.target.value)}
            >
              <MenuItem value="">
                <em>All Trends</em>
              </MenuItem>
              {TREND_OPTIONS.map(trend => (
                <MenuItem key={trend} value={trend}>
                  {trend.replace('_', ' ')}
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
                    Latest Close
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'thirty_day_momentum'}
                    direction={orderBy === 'thirty_day_momentum' ? order : 'asc'}
                    onClick={() => handleRequestSort('thirty_day_momentum')}
                  >
                    30D Momentum
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'ninety_day_momentum'}
                    direction={orderBy === 'ninety_day_momentum' ? order : 'asc'}
                    onClick={() => handleRequestSort('ninety_day_momentum')}
                  >
                    90D Momentum
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  <TableSortLabel
                    active={orderBy === 'momentum_trend'}
                    direction={orderBy === 'momentum_trend' ? order : 'asc'}
                    onClick={() => handleRequestSort('momentum_trend')}
                  >
                    Trend
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
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                    {row.ticker}
                  </TableCell>
                  <TableCell align="right">
                    ${row.latest_close.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={getMomentumColor(row.thirty_day_momentum)}>
                    {row.thirty_day_momentum.toFixed(2)}%
                  </TableCell>
                  <TableCell align="right" sx={getMomentumColor(row.ninety_day_momentum)}>
                    {row.ninety_day_momentum.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      px={1.5}
                      py={0.75}
                      borderRadius={2}
                      display="inline-block"
                      {...getTrendColor(row.momentum_trend)}
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 'medium',
                        textAlign: 'center',
                        minWidth: '100px'
                      }}
                    >
                      {row.momentum_trend.replace('_', ' ')}
                    </Box>
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

export default BullishStocksTable;
