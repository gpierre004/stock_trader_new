// src/models/marketMover.js
module.exports = (sequelize, DataTypes) => {
  const MarketMover = sequelize.define('MarketMover', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticker: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: 'companies',
        key: 'ticker'
      }
    },
    signal_type: {
      type: DataTypes.ENUM('TOP_GAINER', 'TOP_LOSER'),
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    change_percent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    volume: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'market_movers',
    underscored: true,
    indexes: [
      {
        fields: ['ticker', 'date']
      }
    ]
  });

  MarketMover.associate = (db) => {
    MarketMover.belongsTo(db.Company, {
      foreignKey: 'ticker',
      targetKey: 'ticker',
      as: 'company'
    });
  };

  return MarketMover;
};
