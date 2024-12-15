const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { Sequelize } = require('sequelize');

exports.loadTemplateData = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const templatePath = path.join(__dirname, '../template/Consolidated_Account_History.xlsx');
    
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ 
        error: 'Template file not found. Please ensure the template file exists at: ' + templatePath 
      });
    }

    const workbook = xlsx.readFile(templatePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!data || data.length === 0) {
      return res.status(400).json({ 
        error: 'Template file is empty or improperly formatted' 
      });
    }

    const transformedData = data.map(row => {
      const tickerValue = row.ticker || row.symbol || null;
      const type = row.comment?.includes('BOUGHT') ? 'BUY' : 'SELL';
      const purchase_date = row.purchase_date || row.date || null;
      const portfolio_id = row.portfolio_id || null;

      if (!tickerValue) {
        console.error('Missing ticker/symbol in row:', row);
        throw new Error('Missing ticker/symbol in data');
      }

      if (!portfolio_id) {
        console.error('Missing portfolio_id in row:', row);
        throw new Error('Missing portfolio_id in data');
      }

      const transformedRow = {
        ticker: tickerValue.trim(),
        quantity: parseFloat(row.quantity),
        purchase_price: parseFloat(row.purchase_price || row.price),
        type: type.trim(),
        purchase_date: purchase_date ? purchase_date.trim() : null,
        remaining_shares: parseFloat(row.quantity),
        current_price: parseFloat(row.purchase_price || row.price),
        cost_basis: parseFloat(row.quantity) * parseFloat(row.purchase_price || row.price),
        comment: row.comment,
        portfolio_id: portfolio_id
      };

      return transformedRow;
    });

    const requiredFields = ['ticker', 'quantity', 'purchase_price', 'type', 'purchase_date', 'portfolio_id'];
    const firstRow = transformedData[0];
    const missingFields = requiredFields.filter(field => 
      !firstRow[field] || firstRow[field] === undefined || firstRow[field] === null
    );

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Get user's current cash balance
    const user = await db.User.findByPk(req.user.id, { transaction: t });
    let currentBalance = parseFloat(user.cashBalance || 0);

    for (const row of transformedData) {
      try {
        const transaction = await db.Transaction.create(row, { transaction: t });

        // Calculate cash impact
        const cashAmount = row.quantity * row.purchase_price;
        const isBuy = row.type.trim() === 'BUY';
        
        // Update user's cash balance
        currentBalance += isBuy ? -cashAmount : cashAmount;

        // Create cash transaction record
        await db.CashTransaction.create({
          user_id: transaction.portfolio_id,
          transaction_type: isBuy ? 'STOCK_BUY' : 'STOCK_SELL',
          amount: isBuy ? -cashAmount : cashAmount,
          balance_after: currentBalance,
          related_stock_transaction_id: transaction.purchase_id,
          description: `${row.type} ${row.quantity} shares of ${row.ticker} at ${row.purchase_price}`
        }, { transaction: t });

        results.success++;
      } catch (error) {
        console.error('Failed to insert row:', JSON.stringify(row, null, 2));
        console.error('Error:', error.message);
        results.failed++;
        results.errors.push({
          row: row,
          error: error.message
        });
      }
    }

    // Update user's final cash balance
    await user.update({ cashBalance: currentBalance }, { transaction: t });

    await t.commit();

    res.json({
      message: 'Template data processing completed',
      results: {
        totalProcessed: transformedData.length,
        successfulImports: results.success,
        failedImports: results.failed,
        errors: results.errors,
        finalCashBalance: currentBalance
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Error loading template data:', error);
    res.status(500).json({ 
      error: 'Failed to load template data',
      details: error.message 
    });
  }
};

exports.createTransaction = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { ticker, quantity, purchase_price, type, purchase_date } = req.body;

    if (!ticker || !quantity || !purchase_price || !type || !purchase_date) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide ticker, quantity, purchase_price, type, and purchase_date.' 
      });
    }

    const validTypes = ['BUY', 'SELL'];
    const upperType = type.toUpperCase();
    if (!validTypes.includes(upperType)) {
      return res.status(400).json({ 
        error: 'Invalid transaction type. Must be either BUY or SELL.' 
      });
    }

    // Get user's current cash balance
    const user = await db.User.findByPk(req.user.id, { transaction: t });
    const cashAmount = parseFloat(quantity) * parseFloat(purchase_price);
    const isBuy = upperType === 'BUY';

    // Check if user has enough cash for buy transaction
    if (isBuy && parseFloat(user.cashBalance) < cashAmount) {
      await t.rollback();
      return res.status(400).json({
        error: 'Insufficient funds for purchase'
      });
    }

    // Create the transaction record
    const transaction = await db.Transaction.create({
      ticker: ticker.toUpperCase().trim(),
      quantity: parseFloat(quantity),
      purchase_price: parseFloat(purchase_price),
      type: upperType,
      purchase_date: new Date(purchase_date),
      portfolio_id: req.user.id,
      remaining_shares: parseFloat(quantity),
      current_price: parseFloat(purchase_price),
      cost_basis: parseFloat(quantity) * parseFloat(purchase_price)
    }, { transaction: t });

    // Update user's cash balance based on transaction type
    const newBalance = parseFloat(user.cashBalance) + (isBuy ? -cashAmount : cashAmount);
    await user.update({ cashBalance: newBalance }, { transaction: t });

    // Create cash transaction record
    await db.CashTransaction.create({
      user_id: transaction.portfolio_id,
      transaction_type: isBuy ? 'STOCK_BUY' : 'STOCK_SELL',
      amount: isBuy ? -cashAmount : cashAmount,
      balance_after: newBalance,
      related_stock_transaction_id: transaction.purchase_id,
      description: `${upperType} ${quantity} shares of ${ticker.toUpperCase()} at ${purchase_price}`
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: transaction,
      cashBalance: newBalance
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creating transaction:', error);
    res.status(500).json({ 
      error: 'Failed to create transaction',
      details: error.message 
    });
  }
};

exports.getPortfolioTickers = async (req, res) => {
  try {
    const tickers = await db.Transaction.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('ticker')), 'ticker']
      ],
      raw: true
    });

    const tickerList = tickers.map(t => t.ticker);

    res.json(tickerList);
  } catch (error) {
    console.error('Error fetching portfolio tickers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch portfolio tickers',
      details: error.message 
    });
  }
};

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
      const cashAmount = transaction.quantity * transaction.purchase_price;
      // Determine transaction type from description
      const isBuy = transaction.description?.toUpperCase().startsWith('BUY') || 
                   transaction.type?.toUpperCase() === 'BUY';

      // Create cash transaction record with correct sign
      const cashTransaction = await db.CashTransaction.create({
        user_id: transaction.portfolio_id,
        transaction_type: isBuy ? 'STOCK_BUY' : 'STOCK_SELL',
        amount: isBuy ? -cashAmount : cashAmount,
        balance_after: 0, // Will be updated in the next pass
        related_stock_transaction_id: transaction.purchase_id,
        description: `${isBuy ? 'BUY' : 'SELL'} ${transaction.quantity} shares of ${transaction.ticker} at ${transaction.purchase_price}`,
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
        balance += parseFloat(ct.amount);
        await ct.update({ balance_after: balance }, { transaction: t });
      }

      // Update user's cash balance if they exist
      const user = await db.User.findByPk(userId, { transaction: t });
      if (user) {
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
