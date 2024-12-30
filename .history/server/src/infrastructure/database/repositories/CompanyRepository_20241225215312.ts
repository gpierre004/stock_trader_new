import { injectable } from 'inversify';
import { StockPrice } from '../../../domain/entities/StockPrice';
import { Company } from '../../../domain/entities/Company';
import db from '../../../models';

@injectable()
export class CompanyRepository {
  async getAllCompanies(): Promise<Company[]> {
    try {
      const companies = await db.Company.findAll({
        where: { active: true },
        attributes: ['ticker', 'name', 'industry']
      });
      
      return companies.map(company => ({
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
      const stocksByTicker = new Map();
      stockPrices.forEach(price => {
        if (!stocksByTicker.has(price.ticker)) {
          stocksByTicker.set(price.ticker, []);
        }
        stocksByTicker.get(price.ticker).push(price);
      });

      return Array.from(stocksByTicker.entries()).map(([ticker, prices]) => {
        const latestPrice = prices[0];
        const thirtyDayPrice = prices.find(p => p.date <= thirtyDaysAgo);
        const ninetyDayPrice = prices.find(p => p.date <= ninetyDaysAgo);
        
        const thirtyDayPrices = prices.filter(p => p.date >= thirtyDaysAgo);
        const avgVolume = thirtyDayPrices.reduce((sum, p) => sum + p.volume, 0) / thirtyDayPrices.length;
        
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
          lowPrice30Days: Math.min(...thirtyDayPrices.map(p => p.low)),
          highPrice30Days: Math.max(...thirtyDayPrices.map(p => p.high)),
          priceRange30Days: Math.max(...thirtyDayPrices.map(p => p.high)) - Math.min(...thirtyDayPrices.map(p => p.low)),
          movingAverage50Days: prices.slice(0, 50).reduce((sum, p) => sum + p.close, 0) / Math.min(50, prices.length),
          volatility: this.calculateVolatility(thirtyDayPrices),
          supportLevel25: this.calculatePercentile(thirtyDayPrices.map(p => p.low), 25),
          resistanceLevel75: this.calculatePercentile(thirtyDayPrices.map(p => p.high), 75)
        });
      });
    } catch (error) {
      throw new Error(`Failed to fetch stock prices: ${(error as Error).message}`);
    }
  }
}
