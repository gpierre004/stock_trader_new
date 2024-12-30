const { Account } = require('../models');

const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      where: {
        user_id: req.user.id
      },
      attributes: ['id', 'account_number', 'account_name', 'institution'],
      order: [['account_name', 'ASC']]
    });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

const createAccount = async (req, res) => {
  try {
    const { account_number, account_name, institution } = req.body;
    const account = await Account.create({
      user_id: req.user.id,
      account_number,
      account_name,
      institution
    });
    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

module.exports = {
  getAccounts,
  createAccount
};
