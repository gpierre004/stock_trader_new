// server/src/models/cashTransaction.js
module.exports = (sequelize, DataTypes) => {
    const CashTransaction = sequelize.define('CashTransaction', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      transaction_type: {
        type: DataTypes.ENUM('DEPOSIT', 'WITHDRAWAL', 'STOCK_BUY', 'STOCK_SELL'),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      balance_after: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      related_stock_transaction_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'purchase_id'
        }
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      tableName: 'cash_transactions',
      underscored: true
    });
  
    CashTransaction.associate = (models) => {
      CashTransaction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      CashTransaction.belongsTo(models.Transaction, {
        foreignKey: 'related_stock_transaction_id',
        as: 'stockTransaction'
      });
    };
  
    return CashTransaction;
  };