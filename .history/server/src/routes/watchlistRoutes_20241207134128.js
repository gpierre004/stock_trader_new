// src/routes/watchlistRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const watchlistController = require('../controllers/watchlistController');

// Watchlist routes (all require authentication)
router.get('/', auth, watchlistController.getWatchlists);
router.post('/', auth, watchlistController.createWatchlist);
router.get('/:id', auth, watchlistController.getWatchlistById);
router.put('/:id', auth, watchlistController.updateWatchlist);
router.delete('/:id', auth, watchlistController.deleteWatchlist);

// Watchlist items routes
router.post('/:id/stocks', auth, watchlistController.addStockToWatchlist);
router.delete('/:id/stocks/:symbol', auth, watchlistController.removeStockFromWatchlist);

module.exports = router;
