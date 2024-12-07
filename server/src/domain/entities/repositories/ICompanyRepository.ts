// src/domain/repositories/ICompanyRepository.ts  
interface ICompanyRepository {  
    findAll(): Promise<Company[]>;  
    findByTicker(ticker: string): Promise<Company | null>;  
    create(company: Company): Promise<Company>;  
    update(ticker: string, company: Partial<Company>): Promise<Company>;  
  }  
  
  // Similar interfaces for StockPrice and MarketMover repositories  