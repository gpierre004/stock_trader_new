require('dotenv').config();  

module.exports = {  
  development: {  
    username: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME,  
    host: process.env.DB_HOST,  
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: (msg) => console.log(msg),  // Enable detailed logging
    define: {
      timestamps: true,
      underscored: false, // Important: Set to false since DB uses camelCase
      freezeTableName: true // Prevent Sequelize from pluralizing table names
    }
  },  
  test: {  
    username: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME,  
    host: process.env.DB_HOST,  
    dialect: 'postgres',
    logging: false
  },  
  production: {  
    username: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME,  
    host: process.env.DB_HOST,  
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }  
};
