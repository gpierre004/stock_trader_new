import { injectable } from 'inversify';
import { IMarketDataService, MarketOverviewData, MarketMover, BullishStock, BuySellSignal, MomentumData } from './IMarketDataService';
import { StockPrice } from '../domain/entities/StockPrice';
import { CompanyRepository } from '../infrastructure/database/repositories/CompanyRepository';

@injectable()
export class MarketDataService implements IMarketDataService {
  private companyRepository: CompanyRepository;

  constructor() {
    this.companyRepository = new CompanyRepository();
  }

  async getMarketOverview(): Promise<MarketOverviewData> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      const marketTrend = this.calculateMarketTrend(stocks);
      const { gainers, losers } = this.getTopMoversFromStocks(stocks);
      
      return {
        marketTrend,
        topGainers: gainers.slice(0, 5),
        topLosers: losers.slice(0, 5),
        tradingVolume: this.calculateTotalVolume(stocks),
        volatilityIndex: this.calculateVolatilityIndex(stocks)
      };
    } catch (error) {
      throw new Error(`Failed to get market overview: ${(error as Error).message}`);
    }
  }

  async getTopMovers(type: string, limit: number = 5): Promise<MarketMover[]> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      const { gainers, losers } = this.getTopMoversFromStocks(stocks);
      return type === 'gainers' ? gainers.slice(0, limit) : losers.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to get top movers: ${(error as Error).message}`);
    }
  }

  async getBullishStocks(): Promise<BullishStock[]> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      return this.analyzeBullishStocks(stocks);
    } catch (error) {
      throw new Error(`Failed to get bullish stocks: ${(error as Error).message}`);
    }
  }

  async getBuySellSignals(): Promise<BuySellSignal[]> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      return this.analyzeBuySellSignals(stocks);
    } catch (error) {
      throw new Error(`Failed to get buy/sell signals: ${(error as Error).message}`);
    }
  }

  async getMomentumAnalysis(): Promise<MomentumData[]> {
    try {
      const stocks = await this.companyRepository.getAllStockPrices();
      return this.analyzeMomentum(stocks);
    } catch (error) {
      throw new Error(`Failed to get momentum analysis: ${(error as Error).message}`);
    }
  }

  private calculateMarketTrend(stocks: StockPrice[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const gainers = stocks.filter(stock => stock.percentageChange > 0).length;
    const total = stocks.length;
    const gainersPercentage = (gainers / total) * 100;

    if (gainersPercentage >= 60) return 'BULLISH';
    if (gainersPercentage <= 40) return 'BEARISH';
    return 'NEUTRAL';
  }

  private getTopMoversFromStocks(stocks: StockPrice[]): { gainers: MarketMover[], losers: MarketMover[] } {
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

  private calculateTotalVolume(stocks: StockPrice[]): number {
    return stocks.reduce((total, stock) => total + stock.volume, 0);
  }

  private calculateVolatilityIndex(stocks: StockPrice[]): number {
    const volatilities = stocks.map(stock => Math.abs(stock.percentageChange));
    const avgVolatility = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
    return Number(avgVolatility.toFixed(2));
  }

  private analyzeBullishStocks(stocks: StockPrice[]): BullishStock[] {
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

  private analyzeBuySellSignals(stocks: StockPrice[]): BuySellSignal[] {
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

  private analyzeMomentum(stocks: StockPrice[]): MomentumData[] {
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

  private determineMomentumTrend(momentum30d: number, momentum90d: number): string {
    if (momentum30d > 10 && momentum90d > 15) return 'STRONG_UPTREND';
    if (momentum30d > 5 && momentum90d > 10) return 'UPTREND';
    if (momentum30d < -10 && momentum90d < -15) return 'STRONG_DOWNTREND';
    if (momentum30d < -5 && momentum90d < -10) return 'DOWNTREND';
    return 'NEUTRAL';
  }

  private determineVolumeTrend(volume: number, avgVolume: number): string {
    const ratio = volume / avgVolume;
    if (ratio > 1.5) return 'HIGH';
    if (ratio < 0.5) return 'LOW';
    return 'NORMAL';
  }

  private categorizeVolatility(volatility: number): string {
    if (volatility > 3) return 'HIGH';
    if (volatility < 1) return 'LOW';
    return 'MEDIUM';
  }

  private determinePerformanceTrend(change: number): string {
    if (change > 5) return 'STRONG_UP';
    if (change > 2) return 'UP';
    if (change < -5) return 'STRONG_DOWN';
    if (change < -2) return 'DOWN';
    return 'NEUTRAL';
  }

  private determineOverallSignal(stock: StockPrice): string {
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
