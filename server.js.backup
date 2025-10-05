const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Database connection
const db = new sqlite3.Database('./expenses.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables if they don't exist
db.serialize(() => {
  // Expenses table
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Income table
  db.run(`CREATE TABLE IF NOT EXISTS income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL
  )`);

  // Insert default categories if they don't exist
  const defaultCategories = [
    { name: 'Groceries', color: '#e74c3c' },
    { name: 'Breakfast', color: '#f1c40f' },
    { name: 'Kids', color: '#f39c12' },
    { name: 'Daily Items', color: '#2ecc71' },
    { name: 'Transportation', color: '#9b59b6' },
    { name: 'Entertainment', color: '#1abc9c' },
    { name: 'Healthcare', color: '#e67e22' },
    { name: 'Other', color: '#95a5a6' }
  ];

  defaultCategories.forEach(category => {
    db.run(`INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)`, 
      [category.name, category.color]);
  });
});

// API Routes

// Get all expenses
app.get('/api/expenses', (req, res) => {
  const { month, year, category, date } = req.query;
  let query = 'SELECT * FROM expenses';
  let params = [];
  let conditions = [];

  if (month && year) {
    conditions.push('strftime("%m", date) = ? AND strftime("%Y", date) = ?');
    params.push(month.padStart(2, '0'), year);
  } else if (year) {
    conditions.push('strftime("%Y", date) = ?');
    params.push(year);
  }

  if (date) {
    conditions.push('date = ?');
    params.push(date);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY date DESC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new expense
app.post('/api/expenses', (req, res) => {
  const { amount, category, description, date } = req.body;
  
  if (!amount || !category || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
    [amount, category, description, date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Expense added successfully' });
    }
  );
});

// Update expense
app.put('/api/expenses/:id', (req, res) => {
  const { amount, category, description, date } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?',
    [amount, category, description, date, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Expense updated successfully' });
    }
  );
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Expense deleted successfully' });
  });
});

// Get all income
app.get('/api/income', (req, res) => {
  const { month, year, source, date } = req.query;
  let query = 'SELECT * FROM income';
  let params = [];
  let conditions = [];

  if (month && year) {
    conditions.push('strftime("%m", date) = ? AND strftime("%Y", date) = ?');
    params.push(month.padStart(2, '0'), year);
  } else if (year) {
    conditions.push('strftime("%Y", date) = ?');
    params.push(year);
  }

  if (date) {
    conditions.push('date = ?');
    params.push(date);
  }

  if (source) {
    conditions.push('source = ?');
    params.push(source);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY date DESC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new income
app.post('/api/income', (req, res) => {
  const { amount, source, description, date } = req.body;
  
  if (!amount || !source || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO income (amount, source, description, date) VALUES (?, ?, ?, ?)',
    [amount, source, description, date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Income added successfully' });
    }
  );
});

// Update income
app.put('/api/income/:id', (req, res) => {
  const { amount, source, description, date } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE income SET amount = ?, source = ?, description = ?, date = ? WHERE id = ?',
    [amount, source, description, date, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Income updated successfully' });
    }
  );
});

// Delete income
app.delete('/api/income/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM income WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Income deleted successfully' });
  });
});

// Get categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get financial summary
app.get('/api/summary', (req, res) => {
  const { month, year } = req.query;
  
  let expenseQuery = 'SELECT SUM(amount) as total FROM expenses';
  let incomeQuery = 'SELECT SUM(amount) as total FROM income';
  let params = [];
  let conditions = [];

  if (month && year) {
    conditions.push('strftime("%m", date) = ? AND strftime("%Y", date) = ?');
    params.push(month.padStart(2, '0'), year);
  } else if (year) {
    conditions.push('strftime("%Y", date) = ?');
    params.push(year);
  }

  if (conditions.length > 0) {
    const whereClause = ' WHERE ' + conditions.join(' AND ');
    expenseQuery += whereClause;
    incomeQuery += whereClause;
  }

  db.get(expenseQuery, params, (err, expenseResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.get(incomeQuery, params, (err, incomeResult) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const totalExpenses = expenseResult.total || 0;
      const totalIncome = incomeResult.total || 0;
      const netIncome = totalIncome - totalExpenses;

      res.json({
        totalExpenses,
        totalIncome,
        netIncome
      });
    });
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
