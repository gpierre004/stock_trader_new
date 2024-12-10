const xlsx = require('xlsx');
const path = require('path');
const db = require('../models');

exports.loadTemplateData = async (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../template/Consolidated_Account_History.xlsx');
    const workbook = xlsx.readFile(templatePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Process and insert the data
    for (const row of data) {
      await db.Transaction.create({
        symbol: row.Symbol,
        quantity: row.Quantity,
        price: row.Price,
        type: row.Type,
        date: row.Date,
        userId: req.user.id // Assuming you have authentication middleware
      });
    }

    res.json({ message: 'Template data loaded successfully' });
  } catch (error) {
    console.error('Error loading template data:', error);
    res.status(500).json({ error: 'Failed to load template data' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { symbol, quantity, price, type, date } = req.body;
    const transaction = await Transaction.create({
      symbol,
      quantity,
      price,
      type,
      date,
      userId: req.user.id // Assuming you have authentication middleware
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};
