const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const db = require('../models');

exports.loadTemplateData = async (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../template/Consolidated_Account_History.xlsx');
    
    // Check if template file exists
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ 
        error: 'Template file not found. Please ensure the template file exists at: ' + templatePath 
      });
    }

    const workbook = xlsx.readFile(templatePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log('Raw Excel data:', JSON.stringify(data, null, 2));

    if (!data || data.length === 0) {
      return res.status(400).json({ 
        error: 'Template file is empty or improperly formatted' 
      });
    }

    // Transform data to match expected format
    const transformedData = data.map(row => {
      // Trim whitespace from string values
      const ticker = row.ticker ? row.ticker.trim() : null;
      const type = row.comment?.includes('BOUGHT') ? 'BUY' : 'SELL';
      const purchase_date = row.purchase_date ? row.purchase_date.trim() : null;

      return {
        ticker: ticker,
        symbol: ticker, // Set both ticker and symbol to the same value
        quantity: row.quantity,
        purchase_price: row.purchase_price,
        price: row.purchase_price, // Set both price fields
        type: type,
        purchase_date: purchase_date,
        date: new Date(purchase_date), // Set both date fields
        remaining_shares: row.quantity,
        current_price: row.purchase_price,
        cost_basis: row.quantity * row.purchase_price,
        comment: row.comment
      };
    });

    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));

    // Validate required fields
    const requiredFields = ['ticker', 'quantity', 'purchase_price', 'type', 'purchase_date'];
    const firstRow = transformedData[0];
    const missingFields = requiredFields.filter(field => 
      !firstRow[field] || firstRow[field] === undefined || firstRow[field] === null
    );

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Process and insert the data
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const row of transformedData) {
      try {
        console.log('Attempting to insert row:', JSON.stringify(row, null, 2));
        
        const transaction = await db.Transaction.create({
          ...row,
          portfolio_id: req.user.id,
          userId: req.user.id // Set both user ID fields
        });

        console.log('Successfully inserted transaction:', JSON.stringify(transaction, null, 2));
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

    res.json({
      message: 'Template data processing completed',
      results: {
        totalProcessed: transformedData.length,
        successfulImports: results.success,
        failedImports: results.failed,
        errors: results.errors
      }
    });
  } catch (error) {
    console.error('Error loading template data:', error);
    res.status(500).json({ 
      error: 'Failed to load template data',
      details: error.message 
    });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { ticker, quantity, purchase_price, type, purchase_date } = req.body;

    // Validate required fields
    if (!ticker || !quantity || !purchase_price || !type || !purchase_date) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide ticker, quantity, purchase_price, type, and purchase_date.' 
      });
    }

    // Validate transaction type
    const validTypes = ['BUY', 'SELL'];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Invalid transaction type. Must be either BUY or SELL.' 
      });
    }

    const transaction = await db.Transaction.create({
      ticker: ticker.toUpperCase().trim(),
      symbol: ticker.toUpperCase().trim(), // Set both ticker and symbol
      quantity: parseFloat(quantity),
      purchase_price: parseFloat(purchase_price),
      price: parseFloat(purchase_price), // Set both price fields
      type: type.toUpperCase(),
      purchase_date: new Date(purchase_date),
      date: new Date(purchase_date), // Set both date fields
      portfolio_id: req.user.id,
      userId: req.user.id, // Set both user ID fields
      remaining_shares: parseFloat(quantity),
      current_price: parseFloat(purchase_price),
      cost_basis: parseFloat(quantity) * parseFloat(purchase_price)
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ 
      error: 'Failed to create transaction',
      details: error.message 
    });
  }
};
