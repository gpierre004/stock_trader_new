import { Model, BuildOptions, Sequelize } from 'sequelize';

export interface CompanyAttributes {
  ticker: string;
  name: string;
  sector?: string;
  industry?: string;
  active: boolean;
}

export interface StockPriceAttributes {
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

export type CompanyModel = Model<CompanyAttributes> & CompanyAttributes;
export type StockPriceModel = Model<StockPriceAttributes> & StockPriceAttributes;

export type CompanyModelStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): CompanyModel;
};

export type StockPriceModelStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): StockPriceModel;
};

export interface DB {
  Company: CompanyModelStatic;
  StockPrice: StockPriceModelStatic;
}

declare const db: DB & {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
};

export default db;
export { CompanyModel, StockPriceModel };
