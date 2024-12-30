import { injectable } from 'inversify';
import { IMarketDataService, MarketOverviewData, MarketMover, BullishStock, BuySellSignal, MomentumData } from './IMarketDataService';
import { StockPrice } from '../domain/entities/StockPrice';
import { CompanyRepository } from '../infrastructure/database/repositories/CompanyRepository';

@injectable()
export class MarketDataService implements IMarketDataService {
  constructor(
    @inject('CompanyRepository') private companyRepository: CompanyRepository
  ) {}

  async getMarketOverview(): Promise<MarketOverviewData> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      const companies = await this.companyRepository.getAllCompanies();
      
      if (!stocks || stocks.length === 0) {
        return {
          marketTrend: 'NEUTRAL',
          topGainers: [],
          topLosers: [],
          tradingVolume: 0,
          volatilityIndex: 0,
          stocks: []
        };
      }

      const marketTrend = this.calculateMarketTrend(stocks);
      const { gainers, losers } = this.getTopMoversFromStocks(stocks);
      const tradingVolume = this.calculateTotalVolume(stocks);
      const volatilityIndex = this.calculateVolatilityIndex(stocks);
      
      // Prepare stock data for heatmap
      const stocksData = stocks.map(stock => {
        const company = companies.find(c => c.symbol === stock.symbol);
        return {
          symbol: stock.symbol,
          marketCap: stock.marketCap || 0,
          industry: company?.industry || 'Other',
          change24h: stock.percentageChange || 0
        };
      });
      
      return {
        marketTrend,
        topGainers: gainers.slice(0, 5),
        topLosers: losers.slice(0, 5),
        tradingVolume,
        volatilityIndex,
        stocks: stocksData
      };
    } catch (error) {
      console.error('Market overview error:', error);
      // Return safe default values instead of throwing
      return {
        marketTrend: 'NEUTRAL',
        topGainers: [],
        topLosers: [],
        tradingVolume: 0,
        volatilityIndex: 0,
        stocks: []
      };
    }
  }

  async getTopMovers(type: string, limit: number = 5): Promise<MarketMover[]> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      if (!stocks || stocks.length === 0) return [];
      
      const { gainers, losers } = this.getTopMoversFromStocks(stocks);
      return type === 'gainers' ? gainers.slice(0, limit) : losers.slice(0, limit);
    } catch (error) {
      console.error('Top movers error:', error);
      return [];
    }
  }

  async getBullishStocks(): Promise<BullishStock[]> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      if (!stocks || stocks.length === 0) return [];
      
      return this.analyzeBullishStocks(stocks);
    } catch (error) {
      console.error('Bullish stocks error:', error);
      return [];
    }
  }

  async getBuySellSignals(): Promise<BuySellSignal[]> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      if (!stocks || stocks.length === 0) return [];
      
      return this.analyzeBuySellSignals(stocks);
    } catch (error) {
      console.error('Buy/sell signals error:', error);
      return [];
    }
  }

  async getMomentumAnalysis(): Promise<MomentumData[]> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      if (!stocks || stocks.length === 0) return [];
      
      return this.analyzeMomentum(stocks);
    } catch (error) {
      console.error('Momentum analysis error:', error);
      return [];
    }
  }

  private calculateMarketTrend(stocks: StockPrice[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    if (!stocks || stocks.length === 0) return 'NEUTRAL';
    
    const gainers = stocks.filter(stock => stock.percentageChange > 0).length;
    const total = stocks.length;
    const gainersPercentage = (gainers / total) * 100;

    if (gainersPercentage >= 60) return 'BULLISH';
    if (gainersPercentage <= 40) return 'BEARISH';
    return 'NEUTRAL';
  }

  private getTopMoversFromStocks(stocks: StockPrice[]): { gainers: MarketMover[], losers: MarketMover[] } {
    if (!stocks || stocks.length === 0) return { gainers: [], losers: [] };
    
    const sortedStocks = [...stocks].sort((a, b) => b.percentageChange - a.percentageChange);
    
    const gainers = sortedStocks
      .filter(stock => stock.percentageChange > 0)
      .map(stock => ({
        symbol: stock.symbol,
        change: Number(stock.percentageChange.toFixed(2))
      }));

    const losers = sortedStocks
      .filter(stock => stock.percentageChange < 0)
      .map(stock => ({
        symbol: stock.symbol,
        change: Number(stock.percentageChange.toFixed(2))
      }));

    return { gainers, losers };
  }

  private calculateTotalVolume(stocks: StockPrice[]): number {
    if (!stocks || stocks.length === 0) return 0;
    return stocks.reduce((total, stock) => total + (stock.volume || 0), 0);
  }

  private calculateVolatilityIndex(stocks: StockPrice[]): number {
    if (!stocks || stocks.length === 0) return 0;
    
    const volatilities = stocks
      .map(stock => Math.abs(stock.percentageChange || 0))
      .filter(vol => !isNaN(vol));
    
    if (volatilities.length === 0) return 0;
    
    const avgVolatility = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
    return Number(avgVolatility.toFixed(2));
  }

  private analyzeBullishStocks(stocks: StockPrice[]): BullishStock[] {
    if (!stocks || stocks.length === 0) return [];
    
    return stocks
      .filter(stock => stock.percentageChange > 0)
      .map(stock => ({
        ticker: stock.symbol,
        latest_close: Number(stock.close.toFixed(2)),
        close_30d_ago: Number(stock.close30DaysAgo.toFixed(2)),
        close_90d_ago: Number(stock.close90DaysAgo.toFixed(2)),
        thirty_day_momentum: Number(stock.momentum30Days.toFixed(2)),
        ninety_day_momentum: Number(stock.momentum90Days.toFixed(2)),
        momentum_trend: this.determineMomentumTrend(stock.momentum30Days, stock.momentum90Days)
      }));
  }

  private analyzeBuySellSignals(stocks: StockPrice[]): BuySellSignal[] {
    if (!stocks || stocks.length === 0) return [];
    
    return stocks.map(stock => ({
      ticker: stock.symbol,
      latest_close: Number(stock.close.toFixed(2)),
      thirty_day_momentum: Number(stock.momentum30Days.toFixed(2)),
      ninety_day_momentum: Number(stock.momentum90Days.toFixed(2)),
      momentum_trend: this.determineMomentumTrend(stock.momentum30Days, stock.momentum90Days),
      volume_trend: this.determineVolumeTrend(stock.volume, stock.averageVolume),
      volatility_category: this.categorizeVolatility(stock.volatility),
      performance_trend: this.determinePerformanceTrend(stock.percentageChange),
      support_level_25: Number(stock.supportLevel25.toFixed(2)),
      resistance_level_75: Number(stock.resistanceLevel75.toFixed(2)),
      overall_signal: this.determineOverallSignal(stock)
    }));
  }

  private analyzeMomentum(stocks: StockPrice[]): MomentumData[] {
    if (!stocks || stocks.length === 0) return [];
    
    return stocks.map(stock => ({
      ticker: stock.symbol,
      latest_close: Number(stock.close.toFixed(2)),
      start_close_30d: Number(stock.close30DaysAgo.toFixed(2)),
      end_close_30d: Number(stock.close.toFixed(2)),
      min_close_30d: Number(stock.lowPrice30Days.toFixed(2)),
      max_close_30d: Number(stock.highPrice30Days.toFixed(2)),
      thirty_day_return: Number(stock.momentum30Days.toFixed(2)),
      thirty_day_range: Number(stock.priceRange30Days.toFixed(2)),
      performance_trend: this.determinePerformanceTrend(stock.percentageChange)
    }));
  }

  private determineMomentumTrend(momentum30d: number, momentum90d: number): string {
    if (!momentum30d || !momentum90d) return 'NEUTRAL';
    if (momentum30d > 10 && momentum90d > 15) return 'STRONG_UPTREND';
    if (momentum30d > 5 && momentum90d > 10) return 'UPTREND';
    if (momentum30d < -10 && momentum90d < -15) return 'STRONG_DOWNTREND';
    if (momentum30d < -5 && momentum90d < -10) return 'DOWNTREND';
    return 'NEUTRAL';
  }

  private determineVolumeTrend(volume: number, avgVolume: number): string {
    if (!volume || !avgVolume) return 'NORMAL';
    const ratio = volume / avgVolume;
    if (ratio > 1.5) return 'HIGH';
    if (ratio < 0.5) return 'LOW';
    return 'NORMAL';
  }

  private categorizeVolatility(volatility: number): string {
    if (!volatility) return 'LOW';
    if (volatility > 3) return 'HIGH';
    if (volatility < 1) return 'LOW';
    return 'MEDIUM';
  }

  private determinePerformanceTrend(change: number): string {
    if (!change) return 'NEUTRAL';
    if (change > 5) return 'STRONG_UP';
    if (change > 2) return 'UP';
    if (change < -5) return 'STRONG_DOWN';
    if (change < -2) return 'DOWN';
    return 'NEUTRAL';
  }

  private determineOverallSignal(stock: StockPrice): string {
    if (!stock) return 'HOLD';
    
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
