export interface Company {
  symbol: string;
  name: string;
  industry: string;
  marketCap: number;
}

export class CompanyEntity implements Company {
  constructor(
    public symbol: string,
    public name: string,
    public industry: string,
    public marketCap: number
  ) {}

  static create(data: Company): CompanyEntity {
    return new CompanyEntity(
      data.symbol,
      data.name,
      data.industry,
      data.marketCap
    );
  }
}
