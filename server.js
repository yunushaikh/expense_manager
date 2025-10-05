const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase, closeConnection } = require('./config/database');
const DatabaseService = require('./services/databaseService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Initialize database
let dbService;
initializeDatabase()
  .then(() => {
    dbService = new DatabaseService();
    console.log('Database service initialized');
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

// API Routes

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const { month, year, category, date } = req.query;
    const filters = {};
    
    if (month) filters.month = month;
    if (year) filters.year = year;
    if (category) filters.category = category;
    if (date) filters.date = date;
    
    const expenses = await dbService.getExpenses(filters);
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    
    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await dbService.addExpense({ amount, category, description, date });
    res.json({ id: result.lastID, message: 'Expense added successfully' });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const { id } = req.params;

    await dbService.updateExpense(id, { amount, category, description, date });
    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.deleteExpense(id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all income
app.get('/api/income', async (req, res) => {
  try {
    const { month, year, source, date } = req.query;
    const filters = {};
    
    if (month) filters.month = month;
    if (year) filters.year = year;
    if (source) filters.source = source;
    if (date) filters.date = date;
    
    const income = await dbService.getIncome(filters);
    res.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new income
app.post('/api/income', async (req, res) => {
  try {
    const { amount, source, description, date } = req.body;
    
    if (!amount || !source || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await dbService.addIncome({ amount, source, description, date });
    res.json({ id: result.lastID, message: 'Income added successfully' });
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update income
app.put('/api/income/:id', async (req, res) => {
  try {
    const { amount, source, description, date } = req.body;
    const { id } = req.params;

    await dbService.updateIncome(id, { amount, source, description, date });
    res.json({ message: 'Income updated successfully' });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete income
app.delete('/api/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.deleteIncome(id);
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get financial summary
app.get('/api/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    const filters = {};
    
    if (month) filters.month = month;
    if (year) filters.year = year;
    
    const summary = await dbService.getSummary(filters);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Database status endpoint
app.get('/api/database/status', async (req, res) => {
  try {
    const { getDatabaseType } = require('./config/database');
    res.json({ 
      type: getDatabaseType(),
      status: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      type: 'unknown',
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database type: ${process.env.DB_TYPE || 'sqlite'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await closeConnection();
  process.exit(0);
});