'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // First, check if the symbol column exists
      const tableInfo = await queryInterface.describeTable('transactions');
      
      if (tableInfo.symbol) {
        // If symbol column exists, drop it since we're using ticker
        await queryInterface.removeColumn('transactions', 'symbol');
      }
      
      // Ensure the ticker column exists and is properly configured
      if (!tableInfo.ticker) {
        await queryInterface.addColumn('transactions', 'ticker', {
          type: Sequelize.STRING(10),
          allowNull: false
        });
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // This is a corrective migration, so down migration will do nothing
    return Promise.resolve();
  }
};
