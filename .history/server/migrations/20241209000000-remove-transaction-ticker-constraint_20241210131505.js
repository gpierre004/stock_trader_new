'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraint from transactions table
    await queryInterface.removeConstraint(
      'transactions',
      'transactions_ticker_fkey'  // This is the default constraint name Sequelize creates
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the foreign key constraint if needed to rollback
    await queryInterface.addConstraint('transactions', {
      fields: ['ticker'],
      type: 'foreign key',
      name: 'transactions_ticker_fkey',
      references: {
        table: 'companies',
        field: 'ticker'
      }
    });
  }
};
