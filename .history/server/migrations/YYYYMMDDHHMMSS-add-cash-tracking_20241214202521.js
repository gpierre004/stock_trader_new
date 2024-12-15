// server/migrations/YYYYMMDDHHMMSS-add-cash-tracking.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First add cash_balance to users table
    await queryInterface.addColumn('users', 'cash_balance', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    });

    // Create cash_transactions table
    await queryInterface.createTable('cash_transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      transaction_type: {
        type: Sequelize.ENUM('DEPOSIT', 'WITHDRAWAL', 'STOCK_BUY', 'STOCK_SELL'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      balance_after: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      related_stock_transaction_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'purchase_id'
        }
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('cash_transactions', ['user_id', 'created_at']);
    await queryInterface.addIndex('cash_transactions', ['related_stock_transaction_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cash_transactions');
    await queryInterface.removeColumn('users', 'cash_balance');
  }
};