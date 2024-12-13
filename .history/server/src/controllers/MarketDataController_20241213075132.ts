import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IMarketDataService } from '../services/IMarketDataService';

@injectable()
export class MarketDataController {
  constructor(
    @inject('MarketDataService') private marketDataService: IMarketDataService
  ) {}

  async getMarketOverview(req: Request, res: Response): Promise<void> {
    try {
      const overview = await this.marketDataService.getMarketOverview();
      res.json(overview);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getMarketMovers(req: Request, res: Response): Promise<void> {
    try {
      const { type, limit } = req.query;
      const movers = await this.marketDataService.getTopMovers(type as string, Number(limit));
      res.json(movers);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getBullishStocks(req: Request, res: Response): Promise<void> {
    try {
      const bullishStocks = await this.marketDataService.getBullishStocks();
      res.json(bullishStocks);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getBuySellSignals(req: Request, res: Response): Promise<void> {
    try {
      const signals = await this.marketDataService.getBuySellSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getMomentumAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const momentum = await this.marketDataService.getMomentumAnalysis();
      res.json(momentum);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
