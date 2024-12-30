import { Container } from 'inversify';
import { IMarketDataService } from '../../services/IMarketDataService';
import { MarketDataService } from '../../services/MarketDataService';
import { MarketDataController } from '../../controllers/MarketDataController';
import { CompanyRepository } from '../database/repositories/CompanyRepository';

const container = new Container();

// Bind services
container.bind<IMarketDataService>('MarketDataService').to(MarketDataService);
container.bind<MarketDataController>(MarketDataController).toSelf();

// Bind repositories
container.bind<CompanyRepository>('CompanyRepository').to(CompanyRepository);

export { container };
