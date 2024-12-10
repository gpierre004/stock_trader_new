module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    purchase_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    portfolio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: false
    },
    type: {
      type: DataTypes.CHAR(4),
      allowNull: false
    },
    purchase_price: {
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
    underscored: true
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: 'portfolio_id',
      as: 'user',
      targetKey: 'id'
    });
  };

  return Transaction;
};
