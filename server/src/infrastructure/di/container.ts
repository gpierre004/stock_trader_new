// src/infrastructure/di/container.ts  

import { Container } from 'inversify';  
import { MarketDataService } from '../services/MarketDataService';  
import { StockPriceRepository } from '../repositories/StockPriceRepository';  
import { MarketMoverRepository } from '../repositories/MarketMoverRepository';  
import { CompanyRepository } from '../repositories/CompanyRepository';  

const container = new Container();  

container.bind<IMarketDataService>('MarketDataService').to(MarketDataService);  
container.bind('StockPriceRepository').to(StockPriceRepository);  
container.bind('MarketMoverRepository').to(MarketMoverRepository);  
container.bind('CompanyRepository').to(CompanyRepository);  

export { container };  