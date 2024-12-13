class MarketDataService {
  constructor() {
    // Sample data for development
    this.sampleStocks = [
      {
        symbol: 'AAPL',
        close: 150.23,
        percentageChange: 2.5,
        volume: 1000000,
        averageVolume: 800000,
        close30DaysAgo: 145.67,
        close90DaysAgo: 140.89,
        momentum30Days: 3.13,
        momentum90Days: 6.63,
        lowPrice30Days: 142.50,
        highPrice30Days: 152.75,
        priceRange30Days: 10.25,
        movingAverage50Days: 148.45,
        volatility: 1.8,
        supportLevel25: 145.00,
        resistanceLevel75: 153.00
      },
      {
        symbol: 'MSFT',
        close: 290.45,
        percentageChange: -1.2,
        volume: 1200000,
        averageVolume: 1000000,
        close30DaysAgo: 295.67,
        close90DaysAgo: 280.89,
        momentum30Days: -1.77,
        momentum90Days: 3.40,
        lowPrice30Days: 285.50,
        highPrice30Days: 298.75,
        priceRange30Days: 13.25,
        movingAverage50Days: 292.45,
        volatility: 2.1,
        supportLevel25: 285.00,
        resistanceLevel75: 297.00
      },
      {
        symbol: 'GOOGL',
        close: 2750.30,
        percentageChange: 1.8,
        volume: 1500000,
        averageVolume: 1300000,
        close30DaysAgo: 2700.45,
        close90DaysAgo: 2600.89,
        momentum30Days: 1.85,
        momentum90Days: 5.75,
        lowPrice30Days: 2680.50,
        highPrice30Days: 2780.75,
        priceRange30Days: 100.25,
        movingAverage50Days: 2730.45,
        volatility: 1.5,
        supportLevel25: 2700.00,
        resistanceLevel75: 2800.00
      }
    ];
  }

  async getMarketOverview() {
    try {
      const marketTrend = this.calculateMarketTrend(this.sampleStocks);
      const { gainers, losers } = this.getTopMoversFromStocks(this.sampleStocks);
      
      return {
        marketTrend,
        topGainers: gainers.slice(0, 5),
        topLosers: losers.slice(0, 5),
        tradingVolume: this.calculateTotalVolume(this.sampleStocks),
        volatilityIndex: this.calculateVolatilityIndex(this.sampleStocks)
      };
    } catch (error) {
      throw new Error(`Failed to get market overview: ${error.message}`);
    }
  }

  async getTopMovers(type, limit = 5) {
    try {
      const { gainers, losers } = this.getTopMoversFromStocks(this.sampleStocks);
      return type === 'gainers' ? gainers.slice(0, limit) : losers.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to get top movers: ${error.message}`);
    }
  }

  async getBullishStocks() {
    try {
      return this.analyzeBullishStocks(this.sampleStocks);
    } catch (error) {
      throw new Error(`Failed to get bullish stocks: ${error.message}`);
    }
  }

  async getBuySellSignals() {
    try {
      return this.analyzeBuySellSignals(this.sampleStocks);
    } catch (error) {
      throw new Error(`Failed to get buy/sell signals: ${error.message}`);
    }
  }

  async getMomentumAnalysis() {
    try {
      return this.analyzeMomentum(this.sampleStocks);
    } catch (error) {
      throw new Error(`Failed to get momentum analysis: ${error.message}`);
    }
  }

  calculateMarketTrend(stocks) {
    const gainers = stocks.filter(stock => stock.percentageChange > 0).length;
    const total = stocks.length;
    const gainersPercentage = (gainers / total) * 100;

    if (gainersPercentage >= 60) return 'BULLISH';
    if (gainersPercentage <= 40) return 'BEARISH';
    return 'NEUTRAL';
  }

  getTopMoversFromStocks(stocks) {
    const sortedStocks = [...stocks].sort((a, b) => b.percentageChange - a.percentageChange);
    
    const gainers = sortedStocks
      .filter(stock => stock.percentageChange > 0)
      .map(stock => ({
        symbol: stock.symbol,
        change: stock.percentageChange
      }));

    const losers = sortedStocks
      .filter(stock => stock.percentageChange < 0)
      .map(stock => ({
        symbol: stock.symbol,
        change: stock.percentageChange
      }));

    return { gainers, losers };
  }

  calculateTotalVolume(stocks) {
    return stocks.reduce((total, stock) => total + stock.volume, 0);
  }

  calculateVolatilityIndex(stocks) {
    const volatilities = stocks.map(stock => Math.abs(stock.percentageChange));
    const avgVolatility = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
    return Number(avgVolatility.toFixed(2));
  }

  analyzeBullishStocks(stocks) {
    return stocks
      .filter(stock => stock.percentageChange > 0)
      .map(stock => ({
        ticker: stock.symbol,
        latest_close: stock.close,
        close_30d_ago: stock.close30DaysAgo,
        close_90d_ago: stock.close90DaysAgo,
        thirty_day_momentum: stock.momentum30Days,
        ninety_day_momentum: stock.momentum90Days,
        momentum_trend: this.determineMomentumTrend(stock.momentum30Days, stock.momentum90Days)
      }));
  }

  analyzeBuySellSignals(stocks) {
    return stocks.map(stock => ({
      ticker: stock.symbol,
      latest_close: stock.close,
      thirty_day_momentum: stock.momentum30Days,
      ninety_day_momentum: stock.momentum90Days,
      momentum_trend: this.determineMomentumTrend(stock.momentum30Days, stock.momentum90Days),
      volume_trend: this.determineVolumeTrend(stock.volume, stock.averageVolume),
      volatility_category: this.categorizeVolatility(stock.volatility),
      performance_trend: this.determinePerformanceTrend(stock.percentageChange),
      support_level_25: stock.supportLevel25,
      resistance_level_75: stock.resistanceLevel75,
      overall_signal: this.determineOverallSignal(stock)
    }));
  }

  analyzeMomentum(stocks) {
    return stocks.map(stock => ({
      ticker: stock.symbol,
      latest_close: stock.close,
      start_close_30d: stock.close30DaysAgo,
      end_close_30d: stock.close,
      min_close_30d: stock.lowPrice30Days,
      max_close_30d: stock.highPrice30Days,
      thirty_day_return: stock.momentum30Days,
      thirty_day_range: stock.priceRange30Days,
      performance_trend: this.determinePerformanceTrend(stock.percentageChange)
    }));
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
      stock.close > stock.movingAverage50Days,
      stock.percentageChange > 0
    ];

    const bullishSignals = signals.filter(signal => signal).length;
    
    if (bullishSignals >= 3) return 'STRONG_BUY';
    if (bullishSignals === 2) return 'BUY';
    if (bullishSignals === 1) return 'HOLD';
    return 'SELL';
  }
}

module.exports = { MarketDataService };
