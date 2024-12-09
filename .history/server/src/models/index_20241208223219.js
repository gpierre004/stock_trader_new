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
    logging: console.log,
    define: {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
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

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
