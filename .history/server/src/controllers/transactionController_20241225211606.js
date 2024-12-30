const { Transaction, Company } = require('../models');
const { Op } = require('sequelize');

// Existing functions...

const getHoldings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all transactions for the user
    const transactions = await Transaction.findAll({
      where: { userId },
      include: [{
        model: Company,
        attributes: ['sector', 'name']
      }]
    });

    // Aggregate holdings by symbol
    const holdingsMap = transactions.reduce((acc, transaction) => {
      const symbol = transaction.symbol;
      if (!acc[symbol]) {
        acc[symbol] = {
          symbol,
          shares: 0,
          totalCost: 0,
          sector: transaction.Company?.sector || 'Other',
          companyName: transaction.Company?.name || symbol
        };
      }

      // Add or subtract shares based on transaction type
      const shareChange = transaction.type === 'BUY' ? transaction.shares : -transaction.shares;
      acc[symbol].shares += shareChange;
      acc[symbol].totalCost += shareChange * transaction.price;

      return acc;
    }, {});

    // Filter out positions with 0 shares and calculate metrics
    const holdings = Object.values(holdingsMap)
      .filter(holding => holding.shares > 0)
      .map(holding => ({
        ...holding,
        averageCost: holding.totalCost / holding.shares,
        marketValue: holding.shares * (holding.currentPrice || 0), // You'll need to implement price fetching
        percentChange: ((holding.currentPrice || 0) - (holding.totalCost / holding.shares)) / (holding.totalCost / holding.shares) * 100
      }));

    res.json({
      holdings,
      totalValue: holdings.reduce((sum, holding) => sum + holding.marketValue, 0)
    });
  } catch (error) {
    console.error('Error getting holdings:', error);
    res.status(500).json({ message: 'Error getting holdings' });
  }
};

module.exports = {
  // ... existing exports
  getHoldings
};
