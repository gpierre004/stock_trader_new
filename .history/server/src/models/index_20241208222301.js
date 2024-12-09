// src/models/index.js  
const { Sequelize } = require('sequelize');  
const config = require('../../config/database');  
const env = process.env.NODE_ENV || 'development';  
const dbConfig = config[env];  

const sequelize = new Sequelize(  
  dbConfig.database,  
  dbConfig.username,  
  dbConfig.password,  
  {  
    host: dbConfig.host,  
    dialect: dbConfig.dialect,  
    logging: dbConfig.logging,
    define: {
      timestamps: true,
      underscored: false, // Important: Set to false since DB uses camelCase
      freezeTableName: true // Prevent Sequelize from pluralizing table names
    }
  }  
);  

const db = {  
  sequelize,  
  Sequelize,
  User: require('./user')(sequelize, Sequelize),
  Company: require('./company')(sequelize, Sequelize),
  StockPrice: require('./stockPrice')(sequelize, Sequelize),
  MarketMover: require('./marketMover')(sequelize, Sequelize)
};  

// Set up associations if needed
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
