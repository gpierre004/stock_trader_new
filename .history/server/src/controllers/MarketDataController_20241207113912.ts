// src/interfaces/http/controllers/MarketDataController.ts  

import { inject } from 'inversify';  
import { IMarketDataService } from '../domain/services/MarketDataService';  

export class MarketDataController {  
  constructor(  
    @inject('MarketDataService') private marketDataService: IMarketDataService  
  ) {}  

  async getMarketMovers(req: Request, res: Response): Promise<void> {  
    try {  
      const { type, limit } = req.query;  
      const movers = await this.marketDataService.getTopMovers(type as string, Number(limit));  
      res.json(movers);  
    } catch (error) {  
      res.status(500).json({ error: error.message });  
    }  
  }  
}  