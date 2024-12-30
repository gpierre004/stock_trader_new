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
      // TODO: Replace with actual database query
      // For now, return sample data
      return [
        StockPrice.create({
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
        }),
        StockPrice.create({
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
        }),
        StockPrice.create({
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
        })
      ];
    } catch (error) {
      throw new Error(`Failed to fetch stock prices: ${(error as Error).message}`);
    }
  }
}
