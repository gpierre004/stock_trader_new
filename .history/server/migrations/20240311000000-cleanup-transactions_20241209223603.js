'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop columns that are duplicates
    await queryInterface.removeColumn('transactions', 'symbol');
    await queryInterface.removeColumn('transactions', 'price');
    await queryInterface.removeColumn('transactions', 'date');
    await queryInterface.removeColumn('transactions', 'userId');
    await queryInterface.removeColumn('transactions', 'id');
  },

  down: async (queryInterface, Sequelize) => {
    // Add columns back if needed to rollback
    await queryInterface.addColumn('transactions', 'symbol', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('transactions', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
    await queryInterface.addColumn('transactions', 'date', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('transactions', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('transactions', 'id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
