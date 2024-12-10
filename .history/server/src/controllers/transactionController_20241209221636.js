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
      const symbol = row.ticker ? row.ticker.trim() : null;
      const type = row.comment?.includes('BOUGHT') ? 'BUY' : 'SELL';
      const date = row.purchase_date ? row.purchase_date.trim() : null;

      return {
        symbol: symbol,
        quantity: row.quantity,
        price: row.purchase_price,
        type: type,
        date: date
      };
    });

    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));

    // Validate required fields
    const requiredFields = ['symbol', 'quantity', 'price', 'type', 'date'];
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
          symbol: row.symbol,
          quantity: parseFloat(row.quantity),
          price: parseFloat(row.price),
          type: row.type,
          date: new Date(row.date),
          userId: req.user.id
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
      symbol: symbol.toUpperCase().trim(),
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
