import { Model, BuildOptions } from 'sequelize';

interface CompanyAttributes {
  ticker: string;
  name: string;
  sector?: string;
  industry?: string;
  active: boolean;
}

interface StockPriceAttributes {
  id: number;
  ticker: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted_close: number;
}

type CompanyModel = Model<CompanyAttributes> & CompanyAttributes;
type StockPriceModel = Model<StockPriceAttributes> & StockPriceAttributes;

type CompanyModelStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): CompanyModel;
};

type StockPriceModelStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): StockPriceModel;
};

interface DB {
  Company: CompanyModelStatic;
  StockPrice: StockPriceModelStatic;
}

declare const db: DB;
export default db;
