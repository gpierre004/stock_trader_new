export class StockPrice {
  constructor(
    public symbol: string,
    public close: number,
    public percentageChange: number,
    public volume: number,
    public averageVolume: number,
    public marketCap: number,
    public close30DaysAgo: number,
    public close90DaysAgo: number,
    public momentum30Days: number,
    public momentum90Days: number,
    public lowPrice30Days: number,
    public highPrice30Days: number,
    public priceRange30Days: number,
    public movingAverage50Days: number,
    public volatility: number,
    public supportLevel25: number,
    public resistanceLevel75: number
  ) {}

  static create(data: Partial<StockPrice>): StockPrice {
    return new StockPrice(
      data.symbol ?? '',
      data.close ?? 0,
      typeof data.percentageChange === 'number' ? data.percentageChange : 0,
      typeof data.volume === 'number' ? data.volume : 0,
      typeof data.averageVolume === 'number' ? data.averageVolume : 0,
      typeof data.marketCap === 'number' ? data.marketCap : 0,
      typeof data.close30DaysAgo === 'number' ? data.close30DaysAgo : 0,
      typeof data.momentum30Days === 'number' ? data.momentum30Days : 0,
      typeof data.momentum90Days === 'number' ? data.momentum90Days : 0,
      typeof data.lowPrice30Days === 'number' ? data.lowPrice30Days : 0,
      typeof data.highPrice30Days === 'number' ? data.highPrice30Days : 0,
      typeof data.priceRange30Days === 'number' ? data.priceRange30Days : 0,
      typeof data.movingAverage50Days === 'number' ? data.movingAverage50Days : 0,
      typeof data.volatility === 'number' ? data.volatility : 0,
      typeof data.supportLevel25 === 'number' ? data.supportLevel25 : 0,
      typeof data.resistanceLevel75 === 'number' ? data.resistanceLevel75 : 0
    );
  }
}
