// src/domain/services/MarketDataService.ts  

import { Op } from 'sequelize';  
import { MarketMover, StockPrice, Company } from '../entities';  
import { IMarketDataService } from '../interfaces/IMarketDataService';  
import yahooFinance from 'yahoo-finance2';  

export class MarketDataService implements IMarketDataService {  
  private readonly VOLUME_THRESHOLD = 1.5; // 50% above average  
  private readonly PRICE_CHANGE_THRESHOLD = 5; // 5% change for top movers  
  private readonly RSI_OVERBOUGHT = 70;  
  private readonly RSI_OVERSOLD = 30;  

  constructor(  
    private readonly stockPriceRepo: any,  
    private readonly marketMoverRepo: any,  
    private readonly companyRepo: any  
  ) {}  

  async updatePrices(): Promise<void> {  
    try {  
      const companies = await this.companyRepo.findAll({  
        attributes: ['ticker'],  
        raw: true  
      });  

      for (const company of companies) {  
        try {  
          const quote = await yahooFinance.quote(company.ticker);  

          await this.stockPriceRepo.create({  
            ticker: company.ticker,  
            date: new Date(),  
            open: quote.regularMarketOpen,  
            high: quote.regularMarketDayHigh,  
            low: quote.regularMarketDayLow,  
            close: quote.regularMarketPrice,  
            volume: quote.regularMarketVolume,  
            adjusted_close: quote.regularMarketPrice  
          });  
        } catch (error) {  
          console.error(`Error updating price for ${company.ticker}:`, error);  
        }  
      }  
    } catch (error) {  
      console.error('Error in updatePrices:', error);  
      throw error;  
    }  
  }  

  async calculateMarketMovers(): Promise<void> {  
    try {  
      const today = new Date();  
      today.setHours(0, 0, 0, 0);  

      // Get today's prices  
      const prices = await this.stockPriceRepo.findAll({  
        where: {  
          date: {  
            [Op.gte]: today  
          }  
        },  
        include: [{  
          model: Company,  
          attributes: ['sector']  
        }],  
        raw: true  
      });  

      const movers: MarketMover[] = [];  

      // Calculate market statistics  
      for (const price of prices) {  
        const prevPrice = await this.stockPriceRepo.findOne({  
          where: {  
            ticker: price.ticker,  
            date: {  
              [Op.lt]: today  
            }  
          },  
          order: [['date', 'DESC']],  
          raw: true  
        });  

        if (!prevPrice) continue;  

        // Calculate price change  
        const priceChange = ((price.close - prevPrice.close) / prevPrice.close) * 100;  

        // Calculate volume change  
        const avgVolume = await this.calculateAverageVolume(price.ticker, 30);  
        const volumeChange = price.volume / avgVolume;  

        // Top Gainers  
        if (priceChange >= this.PRICE_CHANGE_THRESHOLD) {  
          movers.push({  
            ticker: price.ticker,  
            signalType: 'TOP_GAINER',  
            value: price.close,  
            changePercent: priceChange,  
            volume: price.volume,  
            date: today  
          });  
        }  

        // Top Losers  
        if (priceChange <= -this.PRICE_CHANGE_THRESHOLD) {  
          movers.push({  
            ticker: price.ticker,  
            signalType: 'TOP_LOSER',  
            value: price.close,  
            changePercent: priceChange,  
            volume: price.volume,  
            date: today  
          });  
        }  

        // Unusual Volume  
        if (volumeChange >= this.VOLUME_THRESHOLD) {  
          movers.push({  
            ticker: price.ticker,  
            signalType: 'UNUSUAL_VOLUME',  
            value: price.close,  
            changePercent: priceChange,  
            volume: price.volume,  
            date: today  
          });  
        }  

        // New Highs  
        const yearHigh = await this.calculateYearHigh(price.ticker);  
        if (price.close >= yearHigh) {  
          movers.push({  
            ticker: price.ticker,  
            signalType: 'NEW_HIGH',  
            value: price.close,  
            changePercent: priceChange,  
            volume: price.volume,  
            date: today  
          });  
        }  

        // New Lows  
        const yearLow = await this.calculateYearLow(price.ticker);  
        if (price.close <= yearLow) {  
          movers.push({  
            ticker: price.ticker,  
            signalType: 'NEW_LOW',  
            value: price.close,  
            changePercent: priceChange,  
            volume: price.volume,  
            date: today  
          });  
        }  

        // RSI Calculations  
        const rsi = await this.calculateRSI(price.ticker);  
        if (rsi >= this.RSI_OVERBOUGHT) {  
          movers.push({  
            ticker: price.ticker,  
            signalType: 'OVERBOUGHT',  
            value: price.close,  
            changePercent: priceChange,  
            volume: price.volume,  
            date: today  
          });  
        }  

        if (rsi <= this.RSI_OVERSOLD) {  
          movers.push({  
            ticker: price.ticker,  
            signalType: 'OVERSOLD',  
            value: price.close,  
            changePercent: priceChange,  
            volume: price.volume,  
            date: today  
          });  
        }  
      }  

      // Delete old records for today  
      await this.marketMoverRepo.destroy({  
        where: {  
          date: today  
        }  
      });  

      // Insert new records  
      await this.marketMoverRepo.bulkCreate(movers);  

    } catch (error) {  
      console.error('Error in calculateMarketMovers:', error);  
      throw error;  
    }  
  }  

  async getTopMovers(type: string, limit: number = 20): Promise<MarketMover[]> {  
    try {  
      const today = new Date();  
      today.setHours(0, 0, 0, 0);  

      return await this.marketMoverRepo.findAll({  
        where: {  
          date: today,  
          ...(type && { signalType: type })  
        },  
        order: [['changePercent', 'DESC']],  
        limit  
      });  
    } catch (error) {  
      console.error('Error in getTopMovers:', error);  
      throw error;  
    }  
  }  

  private async calculateAverageVolume(ticker: string, days: number): Promise<number> {  
    const volumes = await this.stockPriceRepo.findAll({  
      where: { ticker },  
      attributes: ['volume'],  
      order: [['date', 'DESC']],  
      limit: days,  
      raw: true  
    });  

    return volumes.reduce((acc, curr) => acc + curr.volume, 0) / volumes.length;  
  }  

  private async calculateYearHigh(ticker: string): Promise<number> {  
    const yearAgo = new Date();  
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);  

    const highest = await this.stockPriceRepo.findOne({  
      where: {  
        ticker,  
        date: {  
          [Op.gte]: yearAgo  
        }  
      },  
      attributes: ['high'],  
      order: [['high', 'DESC']],  
      raw: true  
    });  

    return highest?.high || 0;  
  }  

  private async calculateYearLow(ticker: string): Promise<number> {  
    const yearAgo = new Date();  
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);  

    const lowest = await this.stockPriceRepo.findOne({  
      where: {  
        ticker,  
        date: {  
          [Op.gte]: yearAgo  
        }  
      },  
      attributes: ['low'],  
      order: [['low', 'ASC']],  
      raw: true  
    });  

    return lowest?.low || 0;  
  }  

  private async calculateRSI(ticker: string, periods: number = 14): Promise<number> {  
    const prices = await this.stockPriceRepo.findAll({  
      where: { ticker },  
      attributes: ['close'],  
      order: [['date', 'DESC']],  
      limit: periods + 1,  
      raw: true  
    });  

    if (prices.length < periods + 1) return 50;  

    let gains = 0;  
    let losses = 0;  

    for (let i = 1; i < prices.length; i++) {  
      const difference = prices[i-1].close - prices[i].close;  
      if (difference > 0) {  
        gains += difference;  
      } else {  
        losses -= difference;  
      }  
    }  

    const avgGain = gains / periods;  
    const avgLoss = losses / periods;  

    if (avgLoss === 0) return 100;  

    const rs = avgGain / avgLoss;  
    return 100 - (100 / (1 + rs));  
  }  
}  

// Create interface for the service  
export interface IMarketDataService {  
  updatePrices(): Promise<void>;  
  calculateMarketMovers(): Promise<void>;  
  getTopMovers(type: string, limit?: number): Promise<MarketMover[]>;  
}  