'use strict';  

module.exports = {  
  up: async (queryInterface, Sequelize) => {  
    // Users table  
    await queryInterface.createTable('users', {  
      id: {  
        type: Sequelize.INTEGER,  
        primaryKey: true,  
        autoIncrement: true  
      },  
      name: {  
        type: Sequelize.STRING(50),  
        allowNull: true  
      },  
      email: {  
        type: Sequelize.STRING(255),  
        allowNull: false,  
        unique: true  
      },  
      password: {  
        type: Sequelize.STRING(255),  
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

    // Stock prices table  
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
      open: Sequelize.DOUBLE,  
      high: Sequelize.DOUBLE,  
      low: Sequelize.DOUBLE,  
      close: Sequelize.DOUBLE,  
      volume: Sequelize.BIGINT,  
      adjusted_close: Sequelize.DOUBLE,  
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

    // Transactions table  
    await queryInterface.createTable('transactions', {  
      purchase_id: {  
        type: Sequelize.BIGINT,  
        primaryKey: true,  
        autoIncrement: true  
      },  
      portfolio_id: {  
        type: Sequelize.INTEGER,  
        references: {  
          model: 'users',  
          key: 'id'  
        }  
      },  
      ticker: {  
        type: Sequelize.STRING(10),  
        allowNull: false,  
        references: {  
          model: 'companies',  
          key: 'ticker'  
        }  
      },  
      purchase_date: Sequelize.DATEONLY,  
      quantity: Sequelize.DECIMAL(10, 5),  
      type: Sequelize.CHAR(4),  
      purchase_price: Sequelize.DECIMAL(10, 2),  
      current_price: Sequelize.DECIMAL(10, 2),  
      comment: Sequelize.STRING(200),  
      remaining_shares: Sequelize.DECIMAL(10, 5),  
      cost_basis: Sequelize.DECIMAL(10, 2),  
      realized_gain_loss: Sequelize.DECIMAL(10, 2),  
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

    // Watchlists table  
    await queryInterface.createTable('watchlists', {  
      id: {  
        type: Sequelize.INTEGER,  
        primaryKey: true,  
        autoIncrement: true  
      },  
      userid: {  
        type: Sequelize.INTEGER,  
        references: {  
          model: 'users',  
          key: 'id'  
        }  
      },  
      ticker: {  
        type: Sequelize.STRING(10),  
        references: {  
          model: 'companies',  
          key: 'ticker'  
        }  
      },  
      date_added: {  
        type: Sequelize.DATEONLY,  
        allowNull: false  
      },  
      reason: Sequelize.TEXT,  
      current_price: {  
        type: Sequelize.DOUBLE,  
        defaultValue: 0  
      },  
      week_high_52: {  
        type: Sequelize.DOUBLE,  
        defaultValue: 0  
      },  
      percent_below_52_week_high: {  
        type: Sequelize.DOUBLE,  
        defaultValue: 0  
      },  
      price_when_added: {  
        type: Sequelize.DOUBLE,  
        defaultValue: 0  
      },  
      price_change: Sequelize.DOUBLE,  
      metrics: Sequelize.JSONB,  
      interested: Sequelize.BOOLEAN,  
      last_updated: {  
        type: Sequelize.DATE,  
        defaultValue: Sequelize.NOW  
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
    await queryInterface.addIndex('stock_prices', ['ticker', 'date']);  
    await queryInterface.addIndex('watchlists', ['userid', 'ticker']);  
    await queryInterface.addIndex('transactions', ['portfolio_id', 'ticker']);  
  },  

  down: async (queryInterface, Sequelize) => {  
    // Drop tables in reverse order  
    await queryInterface.dropTable('watchlists');  
    await queryInterface.dropTable('transactions');  
    await queryInterface.dropTable('stock_prices');  
    await queryInterface.dropTable('companies');  
    await queryInterface.dropTable('users');  
  }  
};  