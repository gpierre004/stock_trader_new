// src/models/stockPrice.js  
module.exports = (sequelize, DataTypes) => {  
    const StockPrice = sequelize.define('StockPrice', {  
      id: {  
        type: DataTypes.INTEGER,  
        primaryKey: true,  
        autoIncrement: true  
      },  
      ticker: {  
        type: DataTypes.STRING(10),  
        allowNull: false,  
        references: {  
          model: 'companies',  
          key: 'ticker'  
        }  
      },  
      date: {  
        type: DataTypes.DATE,  
        allowNull: false  
      },  
      open: DataTypes.DECIMAL(10, 2),  
      high: DataTypes.DECIMAL(10, 2),  
      low: DataTypes.DECIMAL(10, 2),  
      close: DataTypes.DECIMAL(10, 2),  
      volume: DataTypes.BIGINT,  
      adjusted_close: DataTypes.DECIMAL(10, 2)  
    }, {  
      tableName: 'stock_prices',  
      underscored: true,  
      indexes: [  
        {  
          unique: true,  
          fields: ['ticker', 'date']  
        }  
      ]  
    });  
  
    return StockPrice;  
  };  