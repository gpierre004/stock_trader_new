const express = require('express');
const router = express.Router();
const { getAccounts, createAccount } = require('../controllers/accountController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all accounts for the authenticated user
router.get('/', getAccounts);

// Create a new account
router.post('/', createAccount);

module.exports = router;
