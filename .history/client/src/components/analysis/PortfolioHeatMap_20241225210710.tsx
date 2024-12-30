import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  percentChange?: number;
}

const CustomContent: React.FC<CustomContentProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  name = '',
  value = 0,
  percentChange = 0
}) => {
  const getColor = (change: number) => {
    if (change > 2) return '#1B5E20';  // Dark green
    if (change > 0) return '#4CAF50';  // Light green
    if (change > -2) return '#EF5350'; // Light red
    return '#B71C1C';                  // Dark red
  };

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={getColor(percentChange)}
        stroke="#fff"
      />
      {width > 50 && height > 30 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
          >
            {percentChange.toFixed(2)}%
          </text>
        </>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc' }}>
        <Typography variant="body2">{data.name}</Typography>
        <Typography variant="body2">Value: ${data.value.toLocaleString()}</Typography>
        <Typography variant="body2">Change: {data.percentChange.toFixed(2)}%</Typography>
      </Box>
    );
  }
  return null;
};

const PortfolioHeatMap: React.FC = () => {
  const portfolio = useSelector((state: any) => state.dashboard.portfolio);

  const data = useMemo(() => {
    if (!portfolio) return [];

    // Group holdings by sector
    const sectorGroups = portfolio.holdings.reduce((acc: any, holding: any) => {
      const sector = holding.sector || 'Other';
      if (!acc[sector]) {
        acc[sector] = {
          name: sector,
          children: []
        };
      }
      acc[sector].children.push({
        name: holding.symbol,
        value: holding.marketValue,
        percentChange: holding.percentChange
      });
      return acc;
    }, {});

    return [{
      name: 'Portfolio',
      children: Object.values(sectorGroups)
    }];
  }, [portfolio]);

  return (
    <Box sx={{ width: '100%', height: 600, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Holdings Heat Map
      </Typography>
      <ResponsiveContainer>
        <Treemap
          data={data}
          dataKey="value"
          aspectRatio={4/3}
          stroke="#fff"
          content={<CustomContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </Box>
  );
};

export default PortfolioHeatMap;
