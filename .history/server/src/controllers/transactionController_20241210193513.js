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
      // Handle both potential column names (symbol or ticker)
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
        type: type,
        purchase_date: purchase_date ? purchase_date.trim() : null,
        remaining_shares: parseFloat(row.quantity),
        current_price: parseFloat(row.purchase_price || row.price),
        cost_basis: parseFloat(row.quantity) * parseFloat(row.purchase_price || row.price),
        comment: row.comment,
        portfolio_id: portfolio_id
      };

      console.log('Transformed row:', transformedRow);
      return transformedRow;
    });

    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));

    // Validate required fields
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

    // Process and insert the data
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const row of transformedData) {
      try {
        console.log('Attempting to insert row:', JSON.stringify(row, null, 2));
        
        const transaction = await db.Transaction.create(row);

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
      quantity: parseFloat(quantity),
      purchase_price: parseFloat(purchase_price),
      type: type.toUpperCase(),
      purchase_date: new Date(purchase_date),
      portfolio_id: req.user.id,
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
