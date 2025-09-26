const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Initialize SQLite database
const db = new sqlite3.Database('./expenses.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create expenses table
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create income table
    db.run(`CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      source TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#3498db',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create income sources table
    db.run(`CREATE TABLE IF NOT EXISTS income_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#27ae60',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default categories
    const defaultCategories = [
      { name: 'Groceries', color: '#e74c3c' },
      { name: 'Kids', color: '#f39c12' },
      { name: 'Daily Items', color: '#2ecc71' },
      { name: 'Transportation', color: '#9b59b6' },
      { name: 'Entertainment', color: '#1abc9c' },
      { name: 'Healthcare', color: '#e67e22' },
      { name: 'Other', color: '#95a5a6' }
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)');
    defaultCategories.forEach(category => {
      stmt.run(category.name, category.color);
    });
    stmt.finalize();

    // Insert default income sources
    const defaultIncomeSources = [
      { name: 'Salary', color: '#27ae60' },
      { name: 'Freelance', color: '#3498db' },
      { name: 'Business', color: '#e67e22' },
      { name: 'Investment', color: '#9b59b6' },
      { name: 'Rental', color: '#1abc9c' },
      { name: 'Bonus', color: '#f39c12' },
      { name: 'Other', color: '#95a5a6' }
    ];

    const incomeStmt = db.prepare('INSERT OR IGNORE INTO income_sources (name, color) VALUES (?, ?)');
    defaultIncomeSources.forEach(source => {
      incomeStmt.run(source.name, source.color);
    });
    incomeStmt.finalize();
  });
}

// API Routes

// Get all expenses
app.get('/api/expenses', (req, res) => {
  const { month, year, category } = req.query;
  let query = 'SELECT * FROM expenses';
  let params = [];
  let conditions = [];

  if (month && year) {
    conditions.push('strftime("%m", date) = ? AND strftime("%Y", date) = ?');
    params.push(month.padStart(2, '0'), year);
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
    res.status(400).json({ error: 'Amount, category, and date are required' });
    return;
  }

  const query = 'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)';
  db.run(query, [amount, category, description, date], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: 'Expense added successfully' });
  });
});

// Update expense
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category, description, date } = req.body;
  
  const query = 'UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?';
  db.run(query, [amount, category, description, date, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.json({ message: 'Expense updated successfully' });
  });
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM expenses WHERE id = ?';
  db.run(query, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.json({ message: 'Expense deleted successfully' });
  });
});

// Get monthly spending by category
app.get('/api/analytics/monthly', (req, res) => {
  const { month, year } = req.query;
  
  if (!month || !year) {
    res.status(400).json({ error: 'Month and year are required' });
    return;
  }

  const query = `
    SELECT 
      category,
      SUM(amount) as total,
      COUNT(*) as count
    FROM expenses 
    WHERE strftime("%m", date) = ? AND strftime("%Y", date) = ?
    GROUP BY category
    ORDER BY total DESC
  `;

  db.all(query, [month.padStart(2, '0'), year], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get spending trends
app.get('/api/analytics/trends', (req, res) => {
  const { months = 6 } = req.query;
  
  const query = `
    SELECT 
      strftime("%Y-%m", date) as month,
      SUM(amount) as total,
      COUNT(*) as count
    FROM expenses 
    WHERE date >= date('now', '-${months} months')
    GROUP BY strftime("%Y-%m", date)
    ORDER BY month ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY name';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// INCOME API ROUTES

// Get all income
app.get('/api/income', (req, res) => {
  const { month, year, source } = req.query;
  let query = 'SELECT * FROM income';
  let params = [];
  let conditions = [];

  if (month && year) {
    conditions.push('strftime("%m", date) = ? AND strftime("%Y", date) = ?');
    params.push(month.padStart(2, '0'), year);
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
    res.status(400).json({ error: 'Amount, source, and date are required' });
    return;
  }

  const query = 'INSERT INTO income (amount, source, description, date) VALUES (?, ?, ?, ?)';
  db.run(query, [amount, source, description, date], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: 'Income added successfully' });
  });
});

// Update income
app.put('/api/income/:id', (req, res) => {
  const { id } = req.params;
  const { amount, source, description, date } = req.body;
  
  const query = 'UPDATE income SET amount = ?, source = ?, description = ?, date = ? WHERE id = ?';
  db.run(query, [amount, source, description, date, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Income not found' });
      return;
    }
    res.json({ message: 'Income updated successfully' });
  });
});

// Delete income
app.delete('/api/income/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM income WHERE id = ?';
  db.run(query, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Income not found' });
      return;
    }
    res.json({ message: 'Income deleted successfully' });
  });
});

// Get monthly income by source
app.get('/api/analytics/income-monthly', (req, res) => {
  const { month, year } = req.query;
  
  if (!month || !year) {
    res.status(400).json({ error: 'Month and year are required' });
    return;
  }

  const query = `
    SELECT 
      source,
      SUM(amount) as total,
      COUNT(*) as count
    FROM income 
    WHERE strftime("%m", date) = ? AND strftime("%Y", date) = ?
    GROUP BY source
    ORDER BY total DESC
  `;

  db.all(query, [month.padStart(2, '0'), year], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get income trends
app.get('/api/analytics/income-trends', (req, res) => {
  const { months = 6 } = req.query;
  
  const query = `
    SELECT 
      strftime("%Y-%m", date) as month,
      SUM(amount) as total,
      COUNT(*) as count
    FROM income 
    WHERE date >= date('now', '-${months} months')
    GROUP BY strftime("%Y-%m", date)
    ORDER BY month ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all income sources
app.get('/api/income-sources', (req, res) => {
  const query = 'SELECT * FROM income_sources ORDER BY name';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// FINANCIAL REPORTS API

// Get comprehensive financial report
app.get('/api/reports/financial', (req, res) => {
  const { month, year } = req.query;
  
  if (!month || !year) {
    res.status(400).json({ error: 'Month and year are required' });
    return;
  }

  const monthStr = month.padStart(2, '0');
  
  // Get total income for the month
  const incomeQuery = `
    SELECT SUM(amount) as total FROM income 
    WHERE strftime("%m", date) = ? AND strftime("%Y", date) = ?
  `;
  
  // Get total expenses for the month
  const expenseQuery = `
    SELECT SUM(amount) as total FROM expenses 
    WHERE strftime("%m", date) = ? AND strftime("%Y", date) = ?
  `;
  
  // Get income by source
  const incomeBySourceQuery = `
    SELECT source, SUM(amount) as total, COUNT(*) as count
    FROM income 
    WHERE strftime("%m", date) = ? AND strftime("%Y", date) = ?
    GROUP BY source
    ORDER BY total DESC
  `;
  
  // Get expenses by category
  const expenseByCategoryQuery = `
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM expenses 
    WHERE strftime("%m", date) = ? AND strftime("%Y", date) = ?
    GROUP BY category
    ORDER BY total DESC
  `;

  db.serialize(() => {
    let report = {
      month: parseInt(month),
      year: parseInt(year),
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      incomeBySource: [],
      expensesByCategory: [],
      insights: []
    };

    db.get(incomeQuery, [monthStr, year], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      report.totalIncome = row.total || 0;
      
      db.get(expenseQuery, [monthStr, year], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        report.totalExpenses = row.total || 0;
        report.netIncome = report.totalIncome - report.totalExpenses;
        
        db.all(incomeBySourceQuery, [monthStr, year], (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          report.incomeBySource = rows;
          
          db.all(expenseByCategoryQuery, [monthStr, year], (err, rows) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            report.expensesByCategory = rows;
            
            // Generate insights
            if (report.totalIncome > report.totalExpenses) {
              report.insights.push({
                type: 'positive',
                message: `You saved ${Math.abs(report.netIncome).toFixed(2)} this month!`,
                percentage: ((report.netIncome / report.totalIncome) * 100).toFixed(1)
              });
            } else if (report.totalExpenses > report.totalIncome) {
              report.insights.push({
                type: 'warning',
                message: `You spent ${Math.abs(report.netIncome).toFixed(2)} more than you earned`,
                percentage: ((Math.abs(report.netIncome) / report.totalIncome) * 100).toFixed(1)
              });
            } else {
              report.insights.push({
                type: 'neutral',
                message: 'Your income and expenses are balanced this month',
                percentage: 0
              });
            }
            
            // Find top expense category
            if (report.expensesByCategory.length > 0) {
              const topCategory = report.expensesByCategory[0];
              report.insights.push({
                type: 'info',
                message: `Your highest expense category is ${topCategory.category} (${((topCategory.total / report.totalExpenses) * 100).toFixed(1)}%)`,
                amount: topCategory.total
              });
            }
            
            res.json(report);
          });
        });
      });
    });
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
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
