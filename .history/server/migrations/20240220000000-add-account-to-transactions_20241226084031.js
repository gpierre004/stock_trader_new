'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions', 'account', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'purchase_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('transactions', 'account');
  }
};
