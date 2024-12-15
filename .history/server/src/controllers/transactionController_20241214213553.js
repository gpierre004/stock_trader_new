const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { Sequelize } = require('sequelize');

// ... [previous code remains unchanged until syncCashTransactions] ...

exports.syncCashTransactions = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    console.log('Starting cash transaction sync');
    
    // Get all transactions that don't have associated cash transactions
    const transactions = await db.Transaction.findAll({
      where: {
        '$CashTransaction.id$': null
      },
      include: [{
        model: db.CashTransaction,
        as: 'CashTransaction',
        required: false
      }],
      order: [['purchase_date', 'ASC']],
      transaction: t
    });

    console.log(`Found ${transactions.length} transactions to sync`);

    if (transactions.length === 0) {
      await t.rollback();
      return res.json({
        message: 'No transactions need syncing',
        synced: 0
      });
    }

    // Create cash transactions for each stock transaction
    for (const transaction of transactions) {
      // Log transaction details for debugging
      console.log('Processing transaction:', {
        id: transaction.purchase_id,
        portfolio_id: transaction.portfolio_id,
        type: transaction.type,
        ticker: transaction.ticker,
        quantity: transaction.quantity,
        price: transaction.purchase_price
      });

      const cashAmount = transaction.quantity * transaction.purchase_price;
      const isBuy = transaction.type === 'BUY'; // Directly use the transaction type

      console.log('Transaction details:', {
        isBuy,
        cashAmount,
        type: transaction.type
      });

      // Create cash transaction record
      const cashTransaction = await db.CashTransaction.create({
        user_id: transaction.portfolio_id, // Use the transaction's portfolio_id
        transaction_type: isBuy ? 'STOCK_BUY' : 'STOCK_SELL',
        amount: isBuy ? -Math.abs(cashAmount) : Math.abs(cashAmount), // Negative for buys, positive for sells
        balance_after: 0, // This will be updated in a separate pass
        related_stock_transaction_id: transaction.purchase_id,
        description: `${transaction.type} ${transaction.quantity} shares of ${transaction.ticker} at ${transaction.purchase_price}`,
        created_at: transaction.purchase_date,
        updated_at: transaction.purchase_date
      }, { transaction: t });

      console.log('Created cash transaction:', {
        id: cashTransaction.id,
        user_id: cashTransaction.user_id,
        type: cashTransaction.transaction_type,
        amount: cashTransaction.amount
      });
    }

    // Update balance_after for all cash transactions in chronological order
    const allCashTransactions = await db.CashTransaction.findAll({
      order: [['created_at', 'ASC']],
      transaction: t
    });

    // Group transactions by user_id
    const userTransactions = {};
    allCashTransactions.forEach(ct => {
      if (!userTransactions[ct.user_id]) {
        userTransactions[ct.user_id] = [];
      }
      userTransactions[ct.user_id].push(ct);
    });

    // Update balance_after for each user's transactions
    for (const userId in userTransactions) {
      let balance = 0;
      for (const ct of userTransactions[userId]) {
        // The amount is already properly signed (negative for buys, positive for sells)
        // so we just need to add it to get the correct balance
        balance += parseFloat(ct.amount);
        
        console.log('Updating balance:', {
          userId,
          transactionType: ct.transaction_type,
          amount: ct.amount,
          oldBalance: balance - parseFloat(ct.amount),
          newBalance: balance
        });
        
        await ct.update({ balance_after: balance }, { transaction: t });
      }

      // Update user's cash balance if they exist
      const user = await db.User.findByPk(userId, { transaction: t });
      if (user) {
        console.log('Updating user balance:', {
          userId,
          finalBalance: balance
        });
        await user.update({ cashBalance: balance }, { transaction: t });
      }
    }

    await t.commit();

    res.json({
      message: 'Cash transactions synchronized successfully',
      synced: transactions.length
    });
  } catch (error) {
    await t.rollback();
    console.error('Error syncing cash transactions:', error);
    res.status(500).json({
      error: 'Failed to sync cash transactions',
      details: error.message
    });
  }
};
