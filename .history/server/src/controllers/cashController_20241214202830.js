// server/src/controllers/cashController.js
const db = require('../models');
const { sequelize } = db;

const cashController = {
  async deposit(req, res) {
    const t = await sequelize.transaction();
    try {
      const { amount } = req.body;
      const userId = req.user.id;

      const user = await db.User.findByPk(userId, { transaction: t });
      if (!user) {
        throw new Error('User not found');
      }

      const newBalance = parseFloat(user.cashBalance) + parseFloat(amount);
      
      await user.update({ cashBalance: newBalance }, { transaction: t });

      await db.CashTransaction.create({
        user_id: userId,
        transaction_type: 'DEPOSIT',
        amount: amount,
        balance_after: newBalance,
        description: 'Cash deposit'
      }, { transaction: t });

      await t.commit();

      res.json({
        message: 'Deposit successful',
        newBalance: newBalance
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: error.message });
    }
  },

  async withdraw(req, res) {
    const t = await sequelize.transaction();
    try {
      const { amount } = req.body;
      const userId = req.user.id;

      const user = await db.User.findByPk(userId, { transaction: t });
      if (!user) {
        throw new Error('User not found');
      }

      if (parseFloat(user.cashBalance) < parseFloat(amount)) {
        throw new Error('Insufficient funds');
      }

      const newBalance = parseFloat(user.cashBalance) - parseFloat(amount);
      
      await user.update({ cashBalance: newBalance }, { transaction: t });

      await db.CashTransaction.create({
        user_id: userId,
        transaction_type: 'WITHDRAWAL',
        amount: -amount,
        balance_after: newBalance,
        description: 'Cash withdrawal'
      }, { transaction: t });

      await t.commit();

      res.json({
        message: 'Withdrawal successful',
        newBalance: newBalance
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: error.message });
    }
  },

  async getBalance(req, res) {
    try {
      const user = await db.User.findByPk(req.user.id);
      res.json({
        balance: user.cashBalance
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTransactionHistory(req, res) {
    try {
      const transactions = await db.CashTransaction.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']],
        include: [{
          model: db.Transaction,
          as: 'stockTransaction',
          attributes: ['ticker', 'quantity', 'purchase_price']
        }]
      });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = cashController;