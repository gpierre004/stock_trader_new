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
      freezeTableName: true, // Prevent Sequelize from pluralizing table names
      underscored: true // Use snake_case rather than camelCase
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
if (db.User.associate) {
  db.User.associate(db);
}
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
