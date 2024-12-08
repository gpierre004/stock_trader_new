const { StockPrice, Company } = require('../models');
const { Op } = require('sequelize');

class MarketMoverService {
  async calculateMarketMovers() {
    try {
      // Get the most recent date with stock prices
      const latestDateRecord = await StockPrice.findOne({
        attributes: [[StockPrice.sequelize.fn('MAX', StockPrice.sequelize.col('date')), 'latestDate']],
        raw: true
      });

      const latestDate = latestDateRecord.latestDate;

      // Find top gainers and losers
      const marketMovers = await StockPrice.findAll({
        where: { date: latestDate },
        include: [{
          model: Company,
          as: 'company',
          attributes: ['name', 'ticker']
        }],
        order: [
          [StockPrice.sequelize.literal('(close - open) / open * 100'), 'DESC']
        ],
        limit: 10
      });

      return marketMovers;
    } catch (error) {
      console.error('Error calculating market movers:', error);
      throw error;
    }
  }
}

module.exports = new MarketMoverService();
