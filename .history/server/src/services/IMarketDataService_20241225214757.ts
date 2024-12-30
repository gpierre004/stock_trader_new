export interface MarketMover {
  symbol: string;
  change: number;
}

export interface StockData {
  symbol: string;
  marketCap: number;
  industry: string;
  change24h: number;
}

export interface MarketOverviewData {
  marketTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  topGainers: MarketMover[];
  topLosers: MarketMover[];
  tradingVolume: number;
  volatilityIndex: number;
  stocks: StockData[];
}

export interface BullishStock {
  ticker: string;
  latest_close: number;
  close_30d_ago: number;
  close_90d_ago: number;
  thirty_day_momentum: number;
  ninety_day_momentum: number;
  momentum_trend: string;
}

export interface BuySellSignal {
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

export interface MomentumData {
  ticker: string;
  latest_close: number;
  start_close_30d: number;
  end_close_30d: number;
  min_close_30d: number;
  max_close_30d: number;
  thirty_day_return: number;
  thirty_day_range: number;
  performance_trend: string;
}

export interface IMarketDataService {
  getMarketOverview(): Promise<MarketOverviewData>;
  getTopMovers(type: string, limit: number): Promise<MarketMover[]>;
  getBullishStocks(): Promise<BullishStock[]>;
  getBuySellSignals(): Promise<BuySellSignal[]>;
  getMomentumAnalysis(): Promise<MomentumData[]>;
}
