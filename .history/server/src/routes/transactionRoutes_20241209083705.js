const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Route to load template data
router.post('/load-template', auth, transactionController.loadTemplateData);

// Route to create a new transaction
router.post('/', auth, transactionController.createTransaction);

module.exports = router;
