// migrations/YYYYMMDDHHMMSS-create-base-tables.js  
'use strict';  

module.exports = {  
  up: async (queryInterface, Sequelize) => {  
    // Companies table  
    await queryInterface.createTable('companies', {  
      ticker: {  
        type: Sequelize.STRING(10),  
        primaryKey: true  
      },  
      name: {  
        type: Sequelize.STRING(255),  
        allowNull: false  
      },  
      sector: Sequelize.STRING(255),  
      industry: Sequelize.STRING(255),  
      active: {  
        type: Sequelize.BOOLEAN,  
        defaultValue: true  
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

    // Stock Prices table  
    await queryInterface.createTable('stock_prices', {  
      id: {  
        type: Sequelize.INTEGER,  
        primaryKey: true,  
        autoIncrement: true  
      },  
      ticker: {  
        type: Sequelize.STRING(10),  
        allowNull: false,  
        references: {  
          model: 'companies',  
          key: 'ticker'  
        }  
      },  
      date: {  
        type: Sequelize.DATE,  
        allowNull: false  
      },  
      open: Sequelize.DECIMAL(10, 2),  
      high: Sequelize.DECIMAL(10, 2),  
      low: Sequelize.DECIMAL(10, 2),  
      close: Sequelize.DECIMAL(10, 2),  
      volume: Sequelize.BIGINT,  
      adjusted_close: Sequelize.DECIMAL(10, 2),  
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

    // Market Movers table  
    await queryInterface.createTable('market_movers', {  
      id: {  
        type: Sequelize.INTEGER,  
        primaryKey: true,  
        autoIncrement: true  
      },  
      ticker: {  
        type: Sequelize.STRING(10),  
        allowNull: false,  
        references: {  
          model: 'companies',  
          key: 'ticker'  
        }  
      },  
      signal_type: {  
        type: Sequelize.ENUM(  
          'TOP_GAINER',  
          'TOP_LOSER',  
          'UNUSUAL_VOLUME',  
          'NEW_HIGH',  
          'NEW_LOW',  
          'OVERBOUGHT',  
          'OVERSOLD',  
          'MOST_VOLATILE',  
          'MOST_ACTIVE'  
        ),  
        allowNull: false  
      },  
      value: Sequelize.DECIMAL(10, 2),  
      change_percent: Sequelize.DECIMAL(10, 2),  
      volume: Sequelize.BIGINT,  
      date: {  
        type: Sequelize.DATE,  
        allowNull: false  
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

    // Create indexes  
    await queryInterface.addIndex('stock_prices', ['ticker', 'date']);  
    await queryInterface.addIndex('market_movers', ['date', 'signal_type']);  
  },  

  down: async (queryInterface, Sequelize) => {  
    await queryInterface.dropTable('market_movers');  
    await queryInterface.dropTable('stock_prices');  
    await queryInterface.dropTable('companies');  
  }  
};  