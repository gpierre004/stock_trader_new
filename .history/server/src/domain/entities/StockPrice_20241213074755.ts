export class StockPrice {
  constructor(
    public symbol: string,
    public close: number,
    public percentageChange: number,
    public volume: number,
    public averageVolume: number,
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
      data.symbol || '',
      data.close || 0,
      data.percentageChange || 0,
      data.volume || 0,
      data.averageVolume || 0,
      data.close30DaysAgo || 0,
      data.close90DaysAgo || 0,
      data.momentum30Days || 0,
      data.momentum90Days || 0,
      data.lowPrice30Days || 0,
      data.highPrice30Days || 0,
      data.priceRange30Days || 0,
      data.movingAverage50Days || 0,
      data.volatility || 0,
      data.supportLevel25 || 0,
      data.resistanceLevel75 || 0
    );
  }
}
