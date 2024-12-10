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

    if (!data || data.length === 0) {
      return res.status(400).json({ 
        error: 'Template file is empty or improperly formatted' 
      });
    }

    // Map template columns to expected format
    const columnMapping = {
      'ticker': 'Symbol',
      'quantity': 'Quantity',
      'purchase_price': 'Price',
      'purchase_date': 'Date'
    };

    // Transform data to match expected format
    const transformedData = data.map(row => {
      const transformedRow = {};
      for (const [templateCol, expectedCol] of Object.entries(columnMapping)) {
        if (templateCol in row) {
          transformedRow[expectedCol] = row[templateCol];
        }
      }
      // Handle the Type column based on the action column
      transformedRow['Type'] = row['action'] || (row['BUY'] ? 'BUY' : 'SELL');
      return transformedRow;
    });

    // Validate required columns
    const requiredColumns = ['Symbol', 'Quantity', 'Price', 'Type', 'Date'];
    const firstRow = transformedData[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        error: `Template is missing required columns: ${missingColumns.join(', ')}` 
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
        await db.Transaction.create({
          symbol: row.Symbol,
          quantity: parseFloat(row.Quantity),
          price: parseFloat(row.Price),
          type: row.Type.toUpperCase(),
          date: new Date(row.Date),
          userId: req.user.id
        });
        results.success++;
      } catch (error) {
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
    const { symbol, quantity, price, type, date } = req.body;

    // Validate required fields
    if (!symbol || !quantity || !price || !type || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide symbol, quantity, price, type, and date.' 
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
      symbol: symbol.toUpperCase(),
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      type: type.toUpperCase(),
      date: new Date(date),
      userId: req.user.id
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
