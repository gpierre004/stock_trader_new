module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    purchase_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    portfolio_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ticker: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: 'companies',
        key: 'ticker'
      }
    },
    symbol: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    purchase_date: {
      type: DataTypes.DATEONLY
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 5)
    },
    type: {
      type: DataTypes.CHAR(4)
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    current_price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    comment: {
      type: DataTypes.STRING(200)
    },
    remaining_shares: {
      type: DataTypes.DECIMAL(10, 5)
    },
    cost_basis: {
      type: DataTypes.DECIMAL(10, 2)
    },
    realized_gain_loss: {
      type: DataTypes.DECIMAL(10, 2)
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    underscored: false // Set to false since we have mixed case column names
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Transaction;
};
