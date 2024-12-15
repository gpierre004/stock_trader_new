const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { Sequelize } = require('sequelize');

// Keep all existing functions unchanged
exports.loadTemplateData = async (req, res) => {
  // ... (keep existing code)
};

exports.createTransaction = async (req, res) => {
  // ... (keep existing code)
};

exports.getPortfolioTickers = async (req, res) => {
  // ... (keep existing code)
};

// Only modify the syncCashTransactions function to fix the association
exports.syncCashTransactions = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    // Get all transactions that don't have associated cash transactions
    const transactions = await db.Transaction.findAll({
      where: {
        portfolio_id: req.user.id
      },
      include: [{
        model: db.CashTransaction,
        as: 'CashTransaction',
        required: false
      }],
      having: Sequelize.literal('CashTransaction.id IS NULL'),
      order: [['purchase_date', 'ASC']],
      transaction: t
    });

    if (transactions.length === 0) {
      await t.rollback();
      return res.json({
        message: 'No transactions need syncing',
        synced: 0
      });
    }

    // Get user's initial balance
    const user = await db.User.findByPk(req.user.id, { transaction: t });
    let currentBalance = parseFloat(user.cashBalance || 0);

    // Create cash transactions for each stock transaction
    for (const transaction of transactions) {
      const cashAmount = transaction.quantity * transaction.purchase_price;
      const isBuy = transaction.type === 'BUY';

      // Update running balance
      if (isBuy) {
        currentBalance -= cashAmount;
      } else {
        currentBalance += cashAmount;
      }

      await db.CashTransaction.create({
        user_id: req.user.id,
        transaction_type: isBuy ? 'STOCK_BUY' : 'STOCK_SELL',
        amount: isBuy ? -cashAmount : cashAmount,
        balance_after: currentBalance,
        related_stock_transaction_id: transaction.purchase_id,
        description: `${transaction.type} ${transaction.quantity} shares of ${transaction.ticker} at ${transaction.purchase_price}`,
        created_at: transaction.purchase_date,
        updated_at: transaction.purchase_date
      }, { transaction: t });
    }

    // Update user's final cash balance
    await user.update({ cashBalance: currentBalance }, { transaction: t });

    await t.commit();

    res.json({
      message: 'Cash transactions synchronized successfully',
      synced: transactions.length,
      finalCashBalance: currentBalance
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
