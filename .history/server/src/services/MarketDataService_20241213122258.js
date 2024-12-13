const { StockPrice, MarketMover, sequelize } = require('../models');
const { Op } = require('sequelize');

class MarketDataService {
  async getMarketOverview(tickers = null) {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      const whereClause = {
        date: {
          [Op.gte]: thirtyDaysAgo
        }
      };

      if (tickers) {
        whereClause.ticker = {
          [Op.in]: tickers
        };
      }

      // Get latest market movers
      const marketMovers = await MarketMover.findAll({
        where: whereClause,
        order: [['date', 'DESC']],
        limit: 10
      });

      // Calculate market trend based on gainers vs losers
      const gainers = marketMovers.filter(mover => mover.signal_type === 'TOP_GAINER');
      const losers = marketMovers.filter(mover => mover.signal_type === 'TOP_LOSER');
      
      const marketTrend = gainers.length > losers.length ? 'BULLISH' : 
                         gainers.length < losers.length ? 'BEARISH' : 'NEUTRAL';

      // Get total trading volume
      const totalVolume = await StockPrice.sum('volume', {
        where: whereClause
      });

      // Calculate volatility index
      const volatilityData = await StockPrice.findAll({
        attributes: [
          'ticker',
          [sequelize.fn('STDDEV', sequelize.col('close')), 'volatility']
        ],
        where: whereClause,
        group: ['ticker']
      });

      const avgVolatility = volatilityData.reduce((sum, data) => 
        sum + parseFloat(data.getDataValue('volatility') || 0), 0) / volatilityData.length;

      return {
        marketTrend,
        topGainers: gainers.map(mover => ({
          symbol: mover.ticker,
          change: parseFloat(mover.change_percent)
        })),
        topLosers: losers.map(mover => ({
          symbol: mover.ticker,
          change: parseFloat(mover.change_percent)
        })),
        tradingVolume: parseInt(totalVolume),
        volatilityIndex: parseFloat(avgVolatility.toFixed(2))
      };
    } catch (error) {
      throw new Error(`Failed to get market overview: ${error.message}`);
    }
  }

  async getBullishStocks(tickers = null) {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90));

      const whereClause = {
        date: {
          [Op.gte]: ninetyDaysAgo
        }
      };

      if (tickers) {
        whereClause.ticker = {
          [Op.in]: tickers
        };
      }

      // First get the latest prices for each ticker
      const latestPrices = await StockPrice.findAll({
        attributes: ['ticker', 'close', 'date'],
        where: whereClause,
        order: [['date', 'DESC']],
        group: ['ticker'],
        having: sequelize.where(sequelize.col('date'), Op.eq, 
          sequelize.literal('(SELECT MAX(date) FROM StockPrices sp2 WHERE sp2.ticker = StockPrice.ticker)')
        )
      });

      // Then get historical prices for comparison
      const historicalPrices = await StockPrice.findAll({
        attributes: [
          'ticker',
          [sequelize.fn('AVG', sequelize.col('close')), 'avg_30d_close'],
          [sequelize.fn('MIN', sequelize.col('close')), 'min_90d_close']
        ],
        where: whereClause,
        group: ['ticker']
      });

      // Combine the data
      const stocksData = latestPrices.map(latest => {
        const historical = historicalPrices.find(h => h.ticker === latest.ticker);
        if (!historical) return null;

        const latestClose = parseFloat(latest.close);
        const avg30DClose = parseFloat(historical.getDataValue('avg_30d_close'));
        const min90DClose = parseFloat(historical.getDataValue('min_90d_close'));

        return {
          ticker: latest.ticker,
          latest_close: latestClose,
          close_30d_ago: avg30DClose,
          close_90d_ago: min90DClose,
          thirty_day_momentum: this.calculateMomentum(latestClose, avg30DClose),
          ninety_day_momentum: this.calculateMomentum(latestClose, min90DClose),
          momentum_trend: this.determineMomentumTrend(
            this.calculateMomentum(latestClose, avg30DClose),
            this.calculateMomentum(latestClose, min90DClose)
          )
        };
      }).filter(stock => stock !== null);

      return stocksData;
    } catch (error) {
      throw new Error(`Failed to get bullish stocks: ${error.message}`);
    }
  }

  async getBuySellSignals(tickers = null) {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      const whereClause = {
        date: {
          [Op.gte]: thirtyDaysAgo
        }
      };

      if (tickers) {
        whereClause.ticker = {
          [Op.in]: tickers
        };
      }

      // Get latest prices first
      const latestPrices = await StockPrice.findAll({
        attributes: ['ticker', 'close', 'volume', 'date'],
        where: whereClause,
        order: [['date', 'DESC']],
        group: ['ticker'],
        having: sequelize.where(sequelize.col('date'), Op.eq, 
          sequelize.literal('(SELECT MAX(date) FROM StockPrices sp2 WHERE sp2.ticker = StockPrice.ticker)')
        )
      });

      // Get historical data for analysis
      const historicalData = await StockPrice.findAll({
        attributes: [
          'ticker',
          [sequelize.fn('AVG', sequelize.col('close')), 'avg_close'],
          [sequelize.fn('AVG', sequelize.col('volume')), 'avg_volume'],
          [sequelize.fn('MAX', sequelize.col('volume')), 'max_volume'],
          [sequelize.fn('STDDEV', sequelize.col('close')), 'volatility']
        ],
        where: whereClause,
        group: ['ticker']
      });

      return latestPrices.map(latest => {
        const historical = historicalData.find(h => h.ticker === latest.ticker);
        if (!historical) return null;

        const latestClose = parseFloat(latest.close);
        const avgClose = parseFloat(historical.getDataValue('avg_close'));

        return {
          ticker: latest.ticker,
          latest_close: latestClose,
          thirty_day_momentum: this.calculateMomentum(latestClose, avgClose),
          ninety_day_momentum: 0, // Calculated if needed
          momentum_trend: this.determineMomentumTrend(
            this.calculateMomentum(latestClose, avgClose),
            0
          ),
          volume_trend: this.determineVolumeTrend(
            latest.volume,
            historical.getDataValue('avg_volume')
          ),
          volatility_category: this.categorizeVolatility(historical.getDataValue('volatility')),
          performance_trend: this.determinePerformanceTrend(
            this.calculateMomentum(latestClose, avgClose)
          ),
          support_level_25: parseFloat((avgClose * 0.95).toFixed(2)),
          resistance_level_75: parseFloat((avgClose * 1.05).toFixed(2)),
          overall_signal: this.determineOverallSignal({
            momentum30Days: this.calculateMomentum(latestClose, avgClose),
            volume: latest.volume,
            averageVolume: historical.getDataValue('avg_volume'),
            close: latestClose,
            movingAverage50Days: avgClose
          })
        };
      }).filter(signal => signal !== null);
    } catch (error) {
      throw new Error(`Failed to get buy/sell signals: ${error.message}`);
    }
  }

  async getMomentumAnalysis(tickers = null) {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      const whereClause = {
        date: {
          [Op.gte]: thirtyDaysAgo
        }
      };

      if (tickers) {
        whereClause.ticker = {
          [Op.in]: tickers
        };
      }

      // Get latest prices first
      const latestPrices = await StockPrice.findAll({
        attributes: ['ticker', 'close', 'date'],
        where: whereClause,
        order: [['date', 'DESC']],
        group: ['ticker'],
        having: sequelize.where(sequelize.col('date'), Op.eq, 
          sequelize.literal('(SELECT MAX(date) FROM StockPrices sp2 WHERE sp2.ticker = StockPrice.ticker)')
        )
      });

      // Get historical data for analysis
      const historicalData = await StockPrice.findAll({
        attributes: [
          'ticker',
          [sequelize.fn('MIN', sequelize.col('close')), 'min_close'],
          [sequelize.fn('MAX', sequelize.col('high')), 'max_high'],
          [sequelize.fn('MIN', sequelize.col('low')), 'min_low'],
          [sequelize.fn('AVG', sequelize.col('close')), 'avg_close']
        ],
        where: whereClause,
        group: ['ticker']
      });

      return latestPrices.map(latest => {
        const historical = historicalData.find(h => h.ticker === latest.ticker);
        if (!historical) return null;

        return {
          ticker: latest.ticker,
          latest_close: parseFloat(latest.close),
          start_close_30d: parseFloat(historical.getDataValue('min_close')),
          end_close_30d: parseFloat(latest.close),
          min_close_30d: parseFloat(historical.getDataValue('min_low')),
          max_close_30d: parseFloat(historical.getDataValue('max_high')),
          thirty_day_return: this.calculateMomentum(
            latest.close,
            historical.getDataValue('min_close')
          ),
          thirty_day_range: parseFloat(
            (historical.getDataValue('max_high') - historical.getDataValue('min_low')).toFixed(2)
          ),
          performance_trend: this.determinePerformanceTrend(
            this.calculateMomentum(latest.close, historical.getDataValue('avg_close'))
          )
        };
      }).filter(analysis => analysis !== null);
    } catch (error) {
      throw new Error(`Failed to get momentum analysis: ${error.message}`);
    }
  }

  calculateMomentum(currentPrice, previousPrice) {
    return parseFloat(((currentPrice - previousPrice) / previousPrice * 100).toFixed(2));
  }

  determineMomentumTrend(momentum30d, momentum90d) {
    if (momentum30d > 10 && momentum90d > 15) return 'STRONG_UPTREND';
    if (momentum30d > 5 && momentum90d > 10) return 'UPTREND';
    if (momentum30d < -10 && momentum90d < -15) return 'STRONG_DOWNTREND';
    if (momentum30d < -5 && momentum90d < -10) return 'DOWNTREND';
    return 'NEUTRAL';
  }

  determineVolumeTrend(volume, avgVolume) {
    const ratio = volume / avgVolume;
    if (ratio > 1.5) return 'HIGH';
    if (ratio < 0.5) return 'LOW';
    return 'NORMAL';
  }

  categorizeVolatility(volatility) {
    if (volatility > 3) return 'HIGH';
    if (volatility < 1) return 'LOW';
    return 'MEDIUM';
  }

  determinePerformanceTrend(change) {
    if (change > 5) return 'STRONG_UP';
    if (change > 2) return 'UP';
    if (change < -5) return 'STRONG_DOWN';
    if (change < -2) return 'DOWN';
    return 'NEUTRAL';
  }

  determineOverallSignal(stock) {
    const signals = [
      stock.momentum30Days > 5,
      stock.volume > stock.averageVolume,
      stock.close > stock.movingAverage50Days
    ];

    const bullishSignals = signals.filter(signal => signal).length;
    
    if (bullishSignals >= 3) return 'STRONG_BUY';
    if (bullishSignals === 2) return 'BUY';
    if (bullishSignals === 1) return 'HOLD';
    return 'SELL';
  }
}

module.exports = { MarketDataService };
