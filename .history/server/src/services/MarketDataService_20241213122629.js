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

      const marketMovers = await MarketMover.findAll({
        where: whereClause,
        order: [['date', 'DESC']],
        limit: 10
      });

      const gainers = marketMovers.filter(mover => mover.signal_type === 'TOP_GAINER');
      const losers = marketMovers.filter(mover => mover.signal_type === 'TOP_LOSER');
      
      const marketTrend = gainers.length > losers.length ? 'BULLISH' : 
                         gainers.length < losers.length ? 'BEARISH' : 'NEUTRAL';

      const totalVolume = await StockPrice.sum('volume', {
        where: whereClause
      });

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
      const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 60)); // Adjusted to get 90 days total

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

      // Get all prices within the date range
      const prices = await StockPrice.findAll({
        where: whereClause,
        order: [['date', 'DESC']],
        raw: true
      });

      // Process the data in memory to get latest and historical prices
      const stocksMap = new Map();
      
      prices.forEach(price => {
        if (!stocksMap.has(price.ticker)) {
          stocksMap.set(price.ticker, {
            latest: price,
            prices: []
          });
        }
        stocksMap.get(price.ticker).prices.push(price);
      });

      const results = [];
      
      stocksMap.forEach((data, ticker) => {
        const { latest, prices } = data;
        
        // Calculate 30-day average
        const thirtyDayPrices = prices.filter(p => new Date(p.date) >= thirtyDaysAgo);
        const avg30DClose = thirtyDayPrices.reduce((sum, p) => sum + p.close, 0) / thirtyDayPrices.length;
        
        // Calculate 90-day minimum
        const min90DClose = Math.min(...prices.map(p => p.close));

        const latestClose = latest.close;

        results.push({
          ticker,
          latest_close: latestClose,
          close_30d_ago: avg30DClose,
          close_90d_ago: min90DClose,
          thirty_day_momentum: this.calculateMomentum(latestClose, avg30DClose),
          ninety_day_momentum: this.calculateMomentum(latestClose, min90DClose),
          momentum_trend: this.determineMomentumTrend(
            this.calculateMomentum(latestClose, avg30DClose),
            this.calculateMomentum(latestClose, min90DClose)
          )
        });
      });

      return results;
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

      const prices = await StockPrice.findAll({
        where: whereClause,
        order: [['date', 'DESC']],
        raw: true
      });

      const stocksMap = new Map();
      
      prices.forEach(price => {
        if (!stocksMap.has(price.ticker)) {
          stocksMap.set(price.ticker, {
            latest: price,
            prices: []
          });
        }
        stocksMap.get(price.ticker).prices.push(price);
      });

      const results = [];

      stocksMap.forEach((data, ticker) => {
        const { latest, prices } = data;
        
        const avgClose = prices.reduce((sum, p) => sum + p.close, 0) / prices.length;
        const avgVolume = prices.reduce((sum, p) => sum + p.volume, 0) / prices.length;
        const maxVolume = Math.max(...prices.map(p => p.volume));
        
        // Calculate volatility
        const mean = prices.reduce((sum, p) => sum + p.close, 0) / prices.length;
        const squaredDiffs = prices.map(p => Math.pow(p.close - mean, 2));
        const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
        const volatility = Math.sqrt(variance);

        results.push({
          ticker,
          latest_close: latest.close,
          thirty_day_momentum: this.calculateMomentum(latest.close, avgClose),
          ninety_day_momentum: 0,
          momentum_trend: this.determineMomentumTrend(
            this.calculateMomentum(latest.close, avgClose),
            0
          ),
          volume_trend: this.determineVolumeTrend(
            latest.volume,
            avgVolume
          ),
          volatility_category: this.categorizeVolatility(volatility),
          performance_trend: this.determinePerformanceTrend(
            this.calculateMomentum(latest.close, avgClose)
          ),
          support_level_25: parseFloat((avgClose * 0.95).toFixed(2)),
          resistance_level_75: parseFloat((avgClose * 1.05).toFixed(2)),
          overall_signal: this.determineOverallSignal({
            momentum30Days: this.calculateMomentum(latest.close, avgClose),
            volume: latest.volume,
            averageVolume: avgVolume,
            close: latest.close,
            movingAverage50Days: avgClose
          })
        });
      });

      return results;
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

      const prices = await StockPrice.findAll({
        where: whereClause,
        order: [['date', 'DESC']],
        raw: true
      });

      const stocksMap = new Map();
      
      prices.forEach(price => {
        if (!stocksMap.has(price.ticker)) {
          stocksMap.set(price.ticker, {
            latest: price,
            prices: []
          });
        }
        stocksMap.get(price.ticker).prices.push(price);
      });

      const results = [];

      stocksMap.forEach((data, ticker) => {
        const { latest, prices } = data;
        
        const minClose = Math.min(...prices.map(p => p.close));
        const maxHigh = Math.max(...prices.map(p => p.high));
        const minLow = Math.min(...prices.map(p => p.low));
        const avgClose = prices.reduce((sum, p) => sum + p.close, 0) / prices.length;

        results.push({
          ticker,
          latest_close: latest.close,
          start_close_30d: minClose,
          end_close_30d: latest.close,
          min_close_30d: minLow,
          max_close_30d: maxHigh,
          thirty_day_return: this.calculateMomentum(
            latest.close,
            minClose
          ),
          thirty_day_range: parseFloat(
            (maxHigh - minLow).toFixed(2)
          ),
          performance_trend: this.determinePerformanceTrend(
            this.calculateMomentum(latest.close, avgClose)
          )
        });
      });

      return results;
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
