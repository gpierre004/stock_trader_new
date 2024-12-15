module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    purchase_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    portfolio_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ticker: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    purchase_date: {
      type: DataTypes.DATEONLY
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
    underscored: true
  });

  Transaction.associate = function(models) {
    Transaction.belongsTo(models.User, {
      foreignKey: 'portfolio_id',
      as: 'user',
      targetKey: 'id'
    });

    // Only set up the association if CashTransaction exists in models
    if (models.CashTransaction) {
      Transaction.hasOne(models.CashTransaction, {
        foreignKey: 'related_stock_transaction_id',
        sourceKey: 'purchase_id',
        as: 'cashTransaction'
      });
    }
  };

  return Transaction;
};
