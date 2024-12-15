// server/src/routes/cashRoutes.js
const express = require('express');
const router = express.Router();
const cashController = require('../controllers/cashController');
const auth = require('../middleware/auth');

router.post('/deposit', auth, cashController.deposit);
router.post('/withdraw', auth, cashController.withdraw);
router.get('/balance', auth, cashController.getBalance);
router.get('/history', auth, cashController.getTransactionHistory);

module.exports = router;