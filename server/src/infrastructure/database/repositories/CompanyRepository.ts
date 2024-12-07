// src/infrastructure/database/repositories/CompanyRepository.ts  
class CompanyRepository implements ICompanyRepository {  
    constructor(private readonly model: typeof Company) {}  
  
    async findAll(): Promise<Company[]> {  
      return this.model.findAll();  
    }  
  
    async findByTicker(ticker: string): Promise<Company | null> {  
      return this.model.findByPk(ticker);  
    }  
  
    // ... other methods  
  }  