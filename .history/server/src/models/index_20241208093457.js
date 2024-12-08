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
    logging: dbConfig.logging  
  }  
);  

const db = {  
  sequelize,  
  Sequelize,
  Company: require('./company')(sequelize, Sequelize),
  StockPrice: require('./stockPrice')(sequelize, Sequelize),
  MarketMover: require('./marketMover')(sequelize, Sequelize)
};  

// Set up associations if needed
if (db.Company.associate) {
  db.Company.associate(db);
}
if (db.StockPrice.associate) {
  db.StockPrice.associate(db);
}
if (db.MarketMover.associate) {
  db.MarketMover.associate(db);
}

module.exports = db;
