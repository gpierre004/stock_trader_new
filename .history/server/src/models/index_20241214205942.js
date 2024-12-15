// src/models/index.js  
const { Sequelize } = require('sequelize');  
const config = require('../../config/database');  
const env = process.env.NODE_ENV || 'development';  
const dbConfig = config[env];  

// Enhanced logging function
const customLogger = (msg) => {
  console.log('Sequelize Log:', msg);
};

// Create Sequelize instance with enhanced error handling
const sequelize = new Sequelize(  
  dbConfig.database,  
  dbConfig.username,  
  dbConfig.password,  
  {  
    host: dbConfig.host,  
    dialect: dbConfig.dialect,  
    logging: customLogger,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false, // Important: Set to false since DB uses camelCase
      freezeTableName: true // Prevent Sequelize from pluralizing table names
    }
  }  
);  

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Log database and table information
    const [results] = await sequelize.query('SELECT current_database(), version();');
    console.log('Database Info:', results[0]);
    
    // Log table schemas
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Available tables:', tables);
    
    for (const table of tables) {
      const schema = await sequelize.getQueryInterface().describeTable(table);
      console.log(`Schema for table ${table}:`, schema);
    }
  } catch (error) {
    console.error('Unable to connect to the database:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// Initialize models
const db = {  
  sequelize,  
  Sequelize,
  User: require('./user')(sequelize, Sequelize),
  Company: require('./company')(sequelize, Sequelize),
  StockPrice: require('./stockPrice')(sequelize, Sequelize),
  MarketMover: require('./marketMover')(sequelize, Sequelize),
  Transaction: require('./transaction')(sequelize, Sequelize),
  CashTransaction: require('./cashTransaction')(sequelize, Sequelize) // Added CashTransaction model
};  

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Test connection immediately
testConnection().catch(error => {
  console.error('Database initialization failed:', error);
});

module.exports = db;
