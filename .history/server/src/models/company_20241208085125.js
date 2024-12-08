// src/models/company.js
module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticker: {
      type: DataTypes.STRING(10),
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sector: DataTypes.STRING,
    industry: DataTypes.STRING,
    market_cap: DataTypes.DECIMAL(15, 2)
  }, {
    tableName: 'companies',
    underscored: true
  });

  Company.associate = (db) => {
    Company.hasMany(db.StockPrice, {
      foreignKey: 'ticker',
      sourceKey: 'ticker',
      as: 'stockPrices'
    });
  };

  return Company;
};
