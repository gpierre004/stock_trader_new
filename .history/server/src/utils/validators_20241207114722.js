const { body } = require('express-validator');  

exports.registerValidation = [  
  body('email').isEmail().normalizeEmail(),  
  body('password').isLength({ min: 6 }),  
  body('name').trim().notEmpty()  
];  

exports.loginValidation = [  
  body('email').isEmail().normalizeEmail(),  
  body('password').notEmpty()  
];  

exports.transactionValidation = [  
  body('ticker').trim().notEmpty(),  
  body('quantity').isFloat({ min: 0.00001 }),  
  body('type').isIn(['BUY', 'SELL']),  
  body('purchase_price').isFloat({ min: 0 })  
];  