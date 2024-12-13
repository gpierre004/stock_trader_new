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
  TablePagination,
  Paper,
  Typography,
  useTheme
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          Bullish Stocks Analysis
        </Typography>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Ticker
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Latest Close
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  30D Momentum
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  90D Momentum
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Trend
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Paper>
  );
};

export default BullishStocksTable;
