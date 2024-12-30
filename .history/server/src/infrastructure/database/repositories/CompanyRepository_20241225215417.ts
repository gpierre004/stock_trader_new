import { injectable } from 'inversify';
import { Op } from 'sequelize';
import { StockPrice } from '../../../domain/entities/StockPrice';
import { Company } from '../../../domain/entities/Company';
import db from '../../../models';
import { CompanyModel, StockPriceModel } from '../../../models';

interface PriceData extends StockPriceModel {
  ticker: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

@injectable()
export class CompanyRepository {
  private calculateVolatility(prices: PriceData[]): number {
    if (prices.length < 2) return 0;
    
    const returns = prices.slice(0, -1).map((price, i) => {
      const nextPrice = prices[i + 1];
      return ((nextPrice.close - price.close) / price.close) * 100;
    });
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const squaredDiffs = returns.map(ret => Math.pow(ret - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length);
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return sorted[lower];
    
    const fraction = index - lower;
    return sorted[lower] * (1 - fraction) + sorted[upper] * fraction;
  }

  async getAllCompanies(): Promise<Company[]> {
    try {
      const companies = await db.Company.findAll({
        where: { active: true },
        attributes: ['ticker', 'name', 'industry']
      });
      
      return companies.map((company: CompanyModel) => ({
        symbol: company.ticker,
        name: company.name,
        industry: company.industry || 'Other',
        marketCap: 0 // This will be updated with real-time data from stock prices
      }));
    } catch (error) {
      throw new Error(`Failed to fetch companies: ${(error as Error).message}`);
    }
  }

  async getAllStockPrices(): Promise<StockPrice[]> {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      const ninetyDaysAgo = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000));

      const stockPrices = await db.StockPrice.findAll({
        where: {
          date: {
            [Op.gte]: ninetyDaysAgo
          }
        },
        order: [['date', 'DESC']],
        include: [{
          model: db.Company,
          as: 'company',
          where: { active: true }
        }]
      });

      // Group by ticker to calculate metrics
      const stocksByTicker = new Map<string, StockPriceModel[]>();
      stockPrices.forEach((price: StockPriceModel) => {
        if (!stocksByTicker.has(price.ticker)) {
          stocksByTicker.set(price.ticker, []);
        }
        stocksByTicker.get(price.ticker)!.push(price);
      });

      return Array.from(stocksByTicker.entries()).map(([ticker, prices]: [string, StockPriceModel[]]) => {
        const latestPrice = prices[0];
        const thirtyDayPrice = prices.find((p: StockPriceModel) => p.date <= thirtyDaysAgo);
        const ninetyDayPrice = prices.find((p: StockPriceModel) => p.date <= ninetyDaysAgo);
        
        const thirtyDayPrices = prices.filter((p: StockPriceModel) => p.date >= thirtyDaysAgo);
        const avgVolume = thirtyDayPrices.reduce((sum: number, p: StockPriceModel) => sum + p.volume, 0) / thirtyDayPrices.length;
        
        return StockPrice.create({
          symbol: ticker,
          close: latestPrice.close,
          percentageChange: ((latestPrice.close - prices[1].close) / prices[1].close) * 100,
          volume: latestPrice.volume,
          averageVolume: avgVolume,
          close30DaysAgo: thirtyDayPrice?.close || latestPrice.close,
          close90DaysAgo: ninetyDayPrice?.close || latestPrice.close,
          momentum30Days: thirtyDayPrice ? ((latestPrice.close - thirtyDayPrice.close) / thirtyDayPrice.close) * 100 : 0,
          momentum90Days: ninetyDayPrice ? ((latestPrice.close - ninetyDayPrice.close) / ninetyDayPrice.close) * 100 : 0,
          lowPrice30Days: Math.min(...thirtyDayPrices.map((p: StockPriceModel) => p.low)),
          highPrice30Days: Math.max(...thirtyDayPrices.map((p: StockPriceModel) => p.high)),
          priceRange30Days: Math.max(...thirtyDayPrices.map((p: StockPriceModel) => p.high)) - Math.min(...thirtyDayPrices.map((p: StockPriceModel) => p.low)),
          movingAverage50Days: prices.slice(0, 50).reduce((sum: number, p: StockPriceModel) => sum + p.close, 0) / Math.min(50, prices.length),
          volatility: this.calculateVolatility(thirtyDayPrices as PriceData[]),
          supportLevel25: this.calculatePercentile(thirtyDayPrices.map((p: StockPriceModel) => p.low), 25),
          resistanceLevel75: this.calculatePercentile(thirtyDayPrices.map((p: StockPriceModel) => p.high), 75)
        });
      });
    } catch (error) {
      throw new Error(`Failed to fetch stock prices: ${(error as Error).message}`);
    }
  }
}
