const { StockPrice, MarketMover, sequelize } = require('../models');
const { Op } = require('sequelize');

class MarketDataService {
  async getMarketOverview() {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      // Get latest market movers
      const marketMovers = await MarketMover.findAll({
        where: {
          date: {
            [Op.gte]: thirtyDaysAgo
          }
        },
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
        where: {
          date: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });

      // Calculate volatility index
      const volatilityData = await StockPrice.findAll({
        attributes: [
          'ticker',
          [sequelize.fn('STDDEV', sequelize.col('close')), 'volatility']
        ],
        where: {
          date: {
            [Op.gte]: thirtyDaysAgo
          }
        },
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

  async getBullishStocks() {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90));

      const stocks = await StockPrice.findAll({
        attributes: [
          'ticker',
          [sequelize.fn('MAX', sequelize.col('close')), 'latest_close'],
          [sequelize.fn('MIN', sequelize.col('close')), 'min_close'],
          [sequelize.fn('AVG', sequelize.col('close')), 'avg_close']
        ],
        where: {
          date: {
            [Op.gte]: ninetyDaysAgo
          }
        },
        group: ['ticker'],
        having: sequelize.literal('MAX(close) > AVG(close)'),
        order: [[sequelize.literal('(MAX(close) - MIN(close)) / MIN(close)'), 'DESC']]
      });

      return stocks.map(stock => ({
        ticker: stock.ticker,
        latest_close: parseFloat(stock.getDataValue('latest_close')),
        close_30d_ago: parseFloat(stock.getDataValue('avg_close')),
        close_90d_ago: parseFloat(stock.getDataValue('min_close')),
        thirty_day_momentum: this.calculateMomentum(stock.getDataValue('latest_close'), stock.getDataValue('avg_close')),
        ninety_day_momentum: this.calculateMomentum(stock.getDataValue('latest_close'), stock.getDataValue('min_close')),
        momentum_trend: this.determineMomentumTrend(
          this.calculateMomentum(stock.getDataValue('latest_close'), stock.getDataValue('avg_close')),
          this.calculateMomentum(stock.getDataValue('latest_close'), stock.getDataValue('min_close'))
        )
      }));
    } catch (error) {
      throw new Error(`Failed to get bullish stocks: ${error.message}`);
    }
  }

  async getBuySellSignals() {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      const stockData = await StockPrice.findAll({
        attributes: [
          'ticker',
          [sequelize.fn('MAX', sequelize.col('close')), 'latest_close'],
          [sequelize.fn('AVG', sequelize.col('close')), 'avg_close'],
          [sequelize.fn('AVG', sequelize.col('volume')), 'avg_volume'],
          [sequelize.fn('MAX', sequelize.col('volume')), 'max_volume'],
          [sequelize.fn('STDDEV', sequelize.col('close')), 'volatility']
        ],
        where: {
          date: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        group: ['ticker']
      });

      return stockData.map(stock => ({
        ticker: stock.ticker,
        latest_close: parseFloat(stock.getDataValue('latest_close')),
        thirty_day_momentum: this.calculateMomentum(stock.getDataValue('latest_close'), stock.getDataValue('avg_close')),
        ninety_day_momentum: 0, // Calculated if needed
        momentum_trend: this.determineMomentumTrend(
          this.calculateMomentum(stock.getDataValue('latest_close'), stock.getDataValue('avg_close')),
          0
        ),
        volume_trend: this.determineVolumeTrend(
          stock.getDataValue('max_volume'),
          stock.getDataValue('avg_volume')
        ),
        volatility_category: this.categorizeVolatility(stock.getDataValue('volatility')),
        performance_trend: this.determinePerformanceTrend(
          this.calculateMomentum(stock.getDataValue('latest_close'), stock.getDataValue('avg_close'))
        ),
        support_level_25: parseFloat((stock.getDataValue('avg_close') * 0.95).toFixed(2)),
        resistance_level_75: parseFloat((stock.getDataValue('avg_close') * 1.05).toFixed(2)),
        overall_signal: this.determineOverallSignal({
          momentum30Days: this.calculateMomentum(stock.getDataValue('latest_close'), stock.getDataValue('avg_close')),
          volume: stock.getDataValue('max_volume'),
          averageVolume: stock.getDataValue('avg_volume'),
          close: stock.getDataValue('latest_close'),
          movingAverage50Days: stock.getDataValue('avg_close')
        })
      }));
    } catch (error) {
      throw new Error(`Failed to get buy/sell signals: ${error.message}`);
    }
  }

  async getMomentumAnalysis() {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      const stocks = await StockPrice.findAll({
        attributes: [
          'ticker',
          [sequelize.fn('MAX', sequelize.col('close')), 'latest_close'],
          [sequelize.fn('MIN', sequelize.col('close')), 'min_close'],
          [sequelize.fn('MAX', sequelize.col('high')), 'max_high'],
          [sequelize.fn('MIN', sequelize.col('low')), 'min_low'],
          [sequelize.fn('AVG', sequelize.col('close')), 'avg_close']
        ],
        where: {
          date: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        group: ['ticker']
      });

      return stocks.map(stock => ({
        ticker: stock.ticker,
        latest_close: parseFloat(stock.getDataValue('latest_close')),
        start_close_30d: parseFloat(stock.getDataValue('min_close')),
        end_close_30d: parseFloat(stock.getDataValue('latest_close')),
        min_close_30d: parseFloat(stock.getDataValue('min_low')),
        max_close_30d: parseFloat(stock.getDataValue('max_high')),
        thirty_day_return: this.calculateMomentum(
          stock.getDataValue('latest_close'),
          stock.getDataValue('min_close')
        ),
        thirty_day_range: parseFloat(
          (stock.getDataValue('max_high') - stock.getDataValue('min_low')).toFixed(2)
        ),
        performance_trend: this.determinePerformanceTrend(
          this.calculateMomentum(stock.getDataValue('latest_close'), stock.getDataValue('avg_close'))
        )
      }));
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
