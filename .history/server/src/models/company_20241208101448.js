// src/models/company.js
module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    ticker: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sector: DataTypes.STRING,
    industry: DataTypes.STRING,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
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
